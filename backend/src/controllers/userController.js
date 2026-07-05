const User = require('../models/User');
const Collaborateur = require('../models/Collaborateur');
const Operation = require('../models/Operation');

const defaultPermissions = {
  admin: ['read', 'write', 'delete', 'manage_users', 'manage_dossiers', 'manage_clients', 'view_stats'],
  avocat: ['read', 'write', 'delete', 'manage_dossiers', 'manage_clients', 'view_stats'],
  collaborateur: ['read', 'write', 'manage_dossiers', 'manage_clients'],
  assistant: ['read', 'write', 'manage_dossiers', 'manage_clients'],
  secretaire: ['read', 'manage_clients']
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, nom, prenom, role, telephone, specialite, tauxHoraire } = req.body;

    if (!email || !password || !nom || !prenom) {
      return res.status(400).json({ message: 'Champs requis manquants (email, password, nom, prenom)' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }
    const validRoles = ['admin', 'avocat', 'collaborateur', 'assistant', 'secretaire'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: `Rôle invalide. Valeurs acceptées : ${validRoles.join(', ')}` });
    }

    // Qui peut créer quoi ?
    // - admin : peut créer un avocat, ou un collaborateur/assistant
    // - avocat : peut créer un collaborateur ou assistant uniquement
    // - les autres rôles : ne peuvent pas créer d'utilisateurs (refus 403)
    const callerRole = req.user.role;
    const userRole = role || 'collaborateur';
    if (callerRole !== 'admin') {
      if (callerRole !== 'avocat') {
        return res.status(403).json({ message: 'Seuls les administrateurs et avocats peuvent créer des membres.' });
      }
      // Un avocat ne peut pas créer un autre admin ni un autre avocat
      if (userRole === 'admin' || userRole === 'avocat') {
        return res.status(403).json({ message: 'Un avocat ne peut pas créer un administrateur ni un autre avocat.' });
      }
    }
    if (userRole === 'admin' && callerRole !== 'admin') {
      return res.status(403).json({ message: 'Seul un administrateur peut créer un autre administrateur.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // ownerId = celui qui a créé le compte.
    // - Si l'appelant est admin et qu'il crée un admin : on refuse déjà au-dessus,
    //   donc dans tous les cas ownerId = req.user._id ici.
    // - Si l'appelant est admin et qu'il crée un avocat : ownerId = req.user._id
    // - Si l'appelant est avocat et qu'il crée un collaborateur : ownerId = req.user._id
    const user = new User({
      email,
      password,
      nom,
      prenom,
      role: userRole,
      telephone,
      ownerId: req.user._id,
      permissions: defaultPermissions[userRole] || ['read']
    });
    await user.save();

    // Création automatique d'une fiche Collaborateur pour les rôles opérationnels
    let collaborateur = null;
    if (['avocat', 'collaborateur', 'assistant'].includes(userRole)) {
      collaborateur = new Collaborateur({
        userId: user._id,
        specialite: Array.isArray(specialite) ? specialite : (specialite ? [specialite] : []),
        tauxHoraire: tauxHoraire || 0
      });
      await collaborateur.save();
    }

    await new Operation({
      type: 'utilisateur_cree',
      entiteType: 'user',
      entiteId: user._id,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `Utilisateur ${user.email} créé (rôle: ${userRole})`
    }).save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: userResponse,
      collaborateur
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    // - admin : voit tous les users
    // - avocat : voit les users qu'il a créés (ownerId = lui), plus lui-même
    // - collaborateur/assistant/secretaire : ne devrait pas appeler cette route (filtré en amont),
    //   mais on retourne au minimum les users accessibles (lui-même + son owner admin/avocat)
    const callerRole = req.user.role;
    let users;
    if (callerRole === 'admin') {
      users = await User.find().select('-password').sort({ createdAt: -1 });
    } else {
      // Liste des users dans le périmètre : ownerId = moi, OU moi-même, OU l'admin
      // (pour qu'un avocat puisse afficher l'admin dans la liste d'affectation d'un dossier,
      //  et qu'un collaborateur voie au moins son avocat/owner)
      const admin = await User.findOne({ email: 'avocat@avocat-pro.tn' }).select('_id').lean();
      const idsInScope = [req.user._id];
      if (admin) idsInScope.push(admin._id);
      users = await User.find({
        $or: [
          { _id: { $in: idsInScope } },
          { ownerId: req.user._id }
        ]
      })
        .select('-password')
        .sort({ createdAt: -1 });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    // Tout le monde peut voir son propre profil
    if (req.params.id === req.user._id.toString()) {
      const me = await User.findById(req.params.id).select('-password');
      if (!me) return res.status(404).json({ message: 'User not found' });
      return res.json(me);
    }
    // Admin : accès total
    if (req.user.role === 'admin') {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }
    // Avocat : peut voir ses collaborateurs (ownerId = lui) et l'admin
    const target = await User.findById(req.params.id).select('-password');
    if (!target) return res.status(404).json({ message: 'User not found' });
    const isOwner = target.ownerId && target.ownerId.toString() === req.user._id.toString();
    const isAdmin = target.email === 'avocat@avocat-pro.tn';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Accès refusé à ce profil.' });
    }
    return res.json(target);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, permissions, isActive } = req.body;
    // Refuser la mise à jour d'un user hors périmètre
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      const target = await User.findById(req.params.id).select('ownerId email');
      if (!target) return res.status(404).json({ message: 'User not found' });
      const isOwner = target.ownerId && target.ownerId.toString() === req.user._id.toString();
      if (!isOwner) {
        return res.status(403).json({ message: 'Accès refusé à la modification de ce profil.' });
      }
    }
    // Un non-admin ne peut pas promouvoir au rôle admin
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Seul un administrateur peut attribuer le rôle admin.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, permissions, isActive },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    await new Operation({
      type: 'utilisateur_modifie',
      entiteType: 'user',
      entiteId: user._id,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `User ${user.email} updated`
    }).save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }
    if (req.user.role !== 'admin') {
      const target = await User.findById(req.params.id).select('ownerId');
      if (!target) return res.status(404).json({ message: 'User not found' });
      const isOwner = target.ownerId && target.ownerId.toString() === req.user._id.toString();
      if (!isOwner) {
        return res.status(403).json({ message: 'Accès refusé : cet utilisateur n\'est pas dans votre équipe.' });
      }
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

exports.getCollaborateurs = async (req, res) => {
  try {
    const collaborateurs = await Collaborateur.find()
      .populate('userId', 'nom prenom email role')
      .sort({ createdAt: -1 });
    res.json(collaborateurs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collaborateurs', error: error.message });
  }
};

exports.getCollaborateurStats = async (req, res) => {
  try {
    const collaborateur = await Collaborateur.findOne({ userId: req.params.id });
    if (!collaborateur) {
      return res.status(404).json({ message: 'Collaborateur not found' });
    }
    res.json(collaborateur.performance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

exports.updateCollaborateurPerformance = async (req, res) => {
  try {
    const { heures, dossiersTraites, note, commentaire } = req.body;
    const collaborateur = await Collaborateur.findOne({ userId: req.params.id });

    collaborateur.performance.totalHeuresTravailles += heures || 0;
    collaborateur.performance.totalDossiersTraites += dossiersTraites || 0;
    collaborateur.performance.historiqueNotes.push({ date: new Date(), note, commentaire });

    const avgNote = collaborateur.performance.historiqueNotes.reduce((sum, n) => sum + n.note, 0) /
      collaborateur.performance.historiqueNotes.length;
    collaborateur.performance.noteMoyenne = avgNote;

    await collaborateur.save();
    res.json(collaborateur);
  } catch (error) {
    res.status(500).json({ message: 'Error updating performance', error: error.message });
  }
};