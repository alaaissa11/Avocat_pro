const Dossier = require('../models/Dossier');
const Tache = require('../models/Tache');
const Document = require('../models/Document');
const HistoriqueDossier = require('../models/HistoriqueDossier');
const Operation = require('../models/Operation');
const iaService = require('../services/iaService');

/**
 * Construit la condition MongoDB qui limite un dossier à un user donné.
 * Un dossier est accessible si :
 *  - l'user en est le créateur
 *  - l'user est `assigneA`
 *  - l'user est dans `collaboreurs`
 * (admin : pas de condition, on retourne tout)
 */
const buildDossierScopeForUser = (user) => {
  if (user.role === 'admin') return {};
  return {
    $or: [
      { assigneA: user._id },
      { collaboreurs: user._id },
      { createdBy: user._id }
    ]
  };
};

const isDossierInScope = async (dossier, user) => {
  if (user.role === 'admin') return true;
  if (!dossier) return false;
  if (dossier.assigneA && dossier.assigneA.toString() === user._id.toString()) return true;
  if (dossier.createdBy && dossier.createdBy.toString() === user._id.toString()) return true;
  if (Array.isArray(dossier.collaboreurs) &&
      dossier.collaboreurs.some(id => id.toString() === user._id.toString())) {
    return true;
  }
  return false;
};

exports.createDossier = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Un non-admin ne peut pas créer de dossier pour quelqu'un d'autre.
    // Il ne peut pas non plus créer de dossier s'il n'est pas admin/avocat.
    if (req.user.role !== 'admin' && req.user.role !== 'avocat') {
      return res.status(403).json({ message: 'Seuls les administrateurs et avocats peuvent créer des dossiers.' });
    }
    const body = { ...req.body };
    if (req.user.role !== 'admin') {
      // L'avocat crée forcément un dossier dont il est responsable
      body.assigneA = req.user._id;
    }
    // L'admin peut créer un dossier sans avocat assigné (assigneA reste undefined/null)
    const dossier = new Dossier({ ...body, createdBy: req.user._id });

    if (dossier.description) {
      const iaPrediction = await iaService.predictCategory(dossier.description);
      dossier.iaPrediction = iaPrediction;
    }

    await dossier.save();

    dossier.addToHistory('dossier_cree', req.user._id, 'Dossier créé', null, dossier.toObject());
    await dossier.save();

    res.status(201).json(dossier);
  } catch (error) {
    res.status(500).json({ message: 'Error creating dossier', error: error.message });
  }
};

exports.getDossiers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, typeAffaire, statut, priorite, assigneeTo } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { titre: { $regex: search, $options: 'i' } },
        { numero: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (typeAffaire) query.typeAffaire = typeAffaire;
    if (statut) query.statut = statut;
    if (priorite) query.priorite = parseInt(priorite);
    if (assigneeTo) query.assigneA = assigneeTo;

    // Filtre par périmètre
    const scope = buildDossierScopeForUser(req.user);
    if (Object.keys(scope).length > 0) {
      if (query.$or) {
        // $and : (filtres saisis) ET (périmètre)
        query.$and = [{ $or: query.$or }, scope];
        delete query.$or;
      } else {
        Object.assign(query, scope);
      }
    }

    const dossiers = await Dossier.find(query)
      .populate('clientId', 'nom prenom')
      .populate('assigneA', 'nom prenom')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Dossier.countDocuments(query);

    res.json({
      dossiers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dossiers', error: error.message });
  }
};

exports.getDossierById = async (req, res) => {
  try {
    const dossier = await Dossier.findById(req.params.id)
      .populate('clientId')
      .populate('assigneA', 'nom prenom email')
      .populate('collaboreurs', 'nom prenom')
      .populate('historique.userId', 'nom prenom');

    if (!dossier) {
      return res.status(404).json({ message: 'Dossier not found' });
    }
    if (!(await isDossierInScope(dossier, req.user))) {
      return res.status(403).json({ message: 'Accès refusé à ce dossier.' });
    }
    res.json(dossier);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dossier', error: error.message });
  }
};

exports.updateDossier = async (req, res) => {
  try {
    const existing = await Dossier.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Dossier not found' });
    }
    if (!(await isDossierInScope(existing, req.user))) {
      return res.status(403).json({ message: 'Accès refusé : dossier hors de votre périmètre.' });
    }
    // Un non-admin ne peut pas changer le `assigneA` pour le faire pointer sur
    // un user hors de son périmètre
    if (req.user.role !== 'admin' && req.body.assigneA &&
        req.body.assigneA.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez affecter un dossier qu\'à vous-même.' });
    }
    const oldDossier = existing;
    const dossier = await Dossier.findByIdAndUpdate(req.params.id, req.body, { new: true });

    dossier.addToHistory(
      'dossier_modifie',
      req.user._id,
      'Dossier modifié',
      oldDossier.toObject(),
      dossier.toObject()
    );
    await dossier.save();

    res.json(dossier);
  } catch (error) {
    res.status(500).json({ message: 'Error updating dossier', error: error.message });
  }
};

exports.deleteDossier = async (req, res) => {
  try {
    const existing = await Dossier.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Dossier not found' });
    }
    if (!(await isDossierInScope(existing, req.user))) {
      return res.status(403).json({ message: 'Accès refusé : dossier hors de votre périmètre.' });
    }
    await Dossier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dossier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting dossier', error: error.message });
  }
};

exports.addCommentaire = async (req, res) => {
  try {
    const { commentaire } = req.body;
    const existing = await Dossier.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Dossier not found' });
    }
    if (!(await isDossierInScope(existing, req.user))) {
      return res.status(403).json({ message: 'Accès refusé : dossier hors de votre périmètre.' });
    }
    const dossier = existing;
    dossier.historique.push({
      action: 'commentaire',
      userId: req.user._id,
      details: commentaire
    });

    await dossier.save();
    res.json(dossier);
  } catch (error) {
    res.status(500).json({ message: 'Error adding commentaire', error: error.message });
  }
};

exports.cloturerDossier = async (req, res) => {
  try {
    const dossier = await Dossier.findById(req.params.id);
    if (!dossier) {
      return res.status(404).json({ message: 'Dossier non trouvé' });
    }
    if (!(await isDossierInScope(dossier, req.user))) {
      return res.status(403).json({ message: 'Accès refusé à ce dossier.' });
    }
    if (dossier.statut === 'cloture') {
      return res.status(400).json({ message: 'Ce dossier est déjà clôturé.' });
    }

    const taches = await Tache.find({ dossierId: dossier._id }).lean();
    const tachesWithDocs = await Promise.all(taches.map(async (tache) => {
      const docs = await Document.find({ tacheId: tache._id })
        .select('_id nom mimeType chemin taille')
        .lean();
      return {
        _id: tache._id,
        titre: tache.titre,
        description: tache.description,
        assigneeA: tache.assigneeA,
        statut: tache.statut,
        priorite: tache.priorite,
        feedback: tache.feedback,
        dateEcheance: tache.dateEcheance,
        documents: docs
      };
    }));

    const historique = new HistoriqueDossier({
      dossier: {
        _id: dossier._id,
        numero: dossier.numero,
        titre: dossier.titre,
        clientId: dossier.clientId,
        typeAffaire: dossier.typeAffaire,
        priorite: dossier.priorite,
        description: dossier.description,
        assigneA: dossier.assigneA,
        dateCreation: dossier.dateCreation,
        dateCloture: new Date()
      },
      taches: tachesWithDocs,
      cloturePar: req.user._id,
      createdBy: req.user._id
    });
    await historique.save();

    dossier.statut = 'cloture';
    dossier.dateCloture = new Date();
    dossier.addToHistory('dossier_cloture', req.user._id, 'Dossier clôturé et archivé dans l\'historique', null, null);
    await dossier.save();

    await new Operation({
      type: 'dossier_cloture',
      entiteType: 'dossier',
      entiteId: dossier._id,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `Dossier "${dossier.numero}" clôturé avec ${taches.length} tâche(s)`
    }).save();

    res.json({ message: 'Dossier clôturé avec succès', historiqueId: historique._id });
  } catch (error) {
    res.status(500).json({ message: 'Error closing dossier', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const baseMatch = buildDossierScopeForUser(req.user);
    const total = await Dossier.countDocuments(baseMatch);
    const matchNouveau = baseMatch.$or
      ? { $and: [baseMatch, { statut: 'nouveau' }] }
      : { statut: 'nouveau' };
    const matchEnCours = baseMatch.$or
      ? { $and: [baseMatch, { statut: 'en_cours' }] }
      : { statut: 'en_cours' };
    const matchCloture = baseMatch.$or
      ? { $and: [baseMatch, { statut: 'cloture' }] }
      : { statut: 'cloture' };

    const nouveau = await Dossier.countDocuments(matchNouveau);
    const enCours = await Dossier.countDocuments(matchEnCours);
    const cloture = await Dossier.countDocuments(matchCloture);

    const byType = await Dossier.aggregate([
      ...(baseMatch.$or ? [{ $match: baseMatch }] : []),
      { $group: { _id: '$typeAffaire', count: { $sum: 1 } } }
    ]);

    const byMonth = await Dossier.aggregate([
      ...(baseMatch.$or ? [{ $match: baseMatch }] : []),
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$dateCreation' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.json({ total, nouveau, enCours, cloture, byType, byMonth });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};