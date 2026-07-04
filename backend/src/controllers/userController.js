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

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    const userRole = role || 'assistant';
    const user = new User({
      email,
      password,
      nom,
      prenom,
      role: userRole,
      telephone,
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
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, permissions, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, permissions, isActive },
      { new: true }
    ).select('-password');

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