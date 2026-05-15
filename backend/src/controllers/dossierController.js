const Dossier = require('../models/Dossier');
const Operation = require('../models/Operation');
const iaService = require('../services/iaService');

exports.createDossier = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const dossier = new Dossier({ ...req.body, createdBy: req.user._id });

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
    res.json(dossier);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dossier', error: error.message });
  }
};

exports.updateDossier = async (req, res) => {
  try {
    const oldDossier = await Dossier.findById(req.params.id);
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
    await Dossier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dossier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting dossier', error: error.message });
  }
};

exports.addCommentaire = async (req, res) => {
  try {
    const { commentaire } = req.body;
    const dossier = await Dossier.findById(req.params.id);

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

exports.getStats = async (req, res) => {
  try {
    const total = await Dossier.countDocuments();
    const nouveau = await Dossier.countDocuments({ statut: 'nouveau' });
    const enCours = await Dossier.countDocuments({ statut: 'en_cours' });
    const cloture = await Dossier.countDocuments({ statut: 'cloture' });

    const byType = await Dossier.aggregate([
      { $group: { _id: '$typeAffaire', count: { $sum: 1 } } }
    ]);

    const byMonth = await Dossier.aggregate([
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