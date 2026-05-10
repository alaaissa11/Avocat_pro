const Tache = require('../models/Tache');
const Operation = require('../models/Operation');

exports.createTache = async (req, res) => {
  try {
    const tache = new Tache({ ...req.body, creePar: req.user._id });
    await tache.save();
    res.status(201).json(tache);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tache', error: error.message });
  }
};

exports.getTaches = async (req, res) => {
  try {
    const { page = 1, limit = 10, statut, assigneeTo, dossierId, priorite } = req.query;
    const query = {};

    if (statut) query.statut = statut;
    if (assigneeTo) query.assigneeA = assigneeTo;
    if (dossierId) query.dossierId = dossierId;
    if (priorite) query.priorite = parseInt(priorite);

    const taches = await Tache.find(query)
      .populate('assigneeA', 'nom prenom')
      .populate('dossierId', 'numero titre')
      .sort({ priorite: -1, dateEcheance: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Tache.countDocuments(query);

    res.json({
      taches,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching taches', error: error.message });
  }
};

exports.getTacheById = async (req, res) => {
  try {
    const tache = await Tache.findById(req.params.id)
      .populate('assigneeA')
      .populate('dossierId')
      .populate('creePar', 'nom prenom');

    if (!tache) {
      return res.status(404).json({ message: 'Tache not found' });
    }
    res.json(tache);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tache', error: error.message });
  }
};

exports.updateTache = async (req, res) => {
  try {
    const tache = await Tache.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await new Operation({
      type: 'tache_modifiee',
      entiteType: 'tache',
      entiteId: tache._id,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `Tâche "${tache.titre}" modified`
    }).save();

    res.json(tache);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tache', error: error.message });
  }
};

exports.deleteTache = async (req, res) => {
  try {
    await Tache.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tache deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tache', error: error.message });
  }
};

exports.terminerTache = async (req, res) => {
  try {
    const { chargeConsommee } = req.body;
    const tache = await Tache.findByIdAndUpdate(
      req.params.id,
      { statut: 'terminee', dateFin: new Date(), chargeConsommee },
      { new: true }
    );

    await new Operation({
      type: 'tache_terminee',
      entiteType: 'tache',
      entiteId: tache._id,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `Tâche "${tache.titre}" completed`
    }).save();

    res.json(tache);
  } catch (error) {
    res.status(500).json({ message: 'Error completing tache', error: error.message });
  }
};

exports.getMyTaches = async (req, res) => {
  try {
    const { statut } = req.query;
    const query = { assigneeA: req.user._id };
    if (statut) query.statut = statut;

    const taches = await Tache.find(query)
      .populate('dossierId', 'numero titre')
      .sort({ dateEcheance: 1 });

    res.json(taches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user tasks', error: error.message });
  }
};