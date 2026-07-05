const Tache = require('../models/Tache');
const Operation = require('../models/Operation');
const Dossier = require('../models/Dossier');

const buildTacheScopeForUser = (user) => {
  if (user.role === 'admin') return {};
  return {
    $or: [
      { assigneeA: user._id },
      { creePar: user._id }
    ]
  };
};

const isTacheInScope = async (tache, user) => {
  if (user.role === 'admin') return true;
  if (!tache) return false;
  if (tache.assigneeA && tache.assigneeA.toString() === user._id.toString()) return true;
  if (tache.creePar && tache.creePar.toString() === user._id.toString()) return true;
  return false;
};

exports.createTache = async (req, res) => {
  try {
    const { dossierId, assigneeA } = req.body;

    if (dossierId && assigneeA) {
      const dossier = await Dossier.findById(dossierId);
      if (!dossier) {
        return res.status(404).json({ message: 'Dossier non trouvé' });
      }
      const isDossierInScope = req.user.role === 'admin' ||
        dossier.assigneA?.toString() === req.user._id.toString() ||
        dossier.createdBy?.toString() === req.user._id.toString() ||
        dossier.collaboreurs?.some(id => id.toString() === req.user._id.toString());
      if (!isDossierInScope) {
        return res.status(403).json({ message: 'Vous ne pouvez pas créer une tâche pour un dossier hors de votre périmètre.' });
      }
    }

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

    const scope = buildTacheScopeForUser(req.user);
    if (Object.keys(scope).length > 0) {
      if (query.$or) {
        query.$and = [{ $or: query.$or }, scope];
        delete query.$or;
      } else {
        Object.assign(query, scope);
      }
    }

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
    if (!(await isTacheInScope(tache, req.user))) {
      return res.status(403).json({ message: 'Accès refusé à cette tâche.' });
    }
    res.json(tache);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tache', error: error.message });
  }
};

exports.updateTache = async (req, res) => {
  try {
    const existing = await Tache.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Tache not found' });
    }
    if (!(await isTacheInScope(existing, req.user))) {
      return res.status(403).json({ message: 'Accès refusé à cette tâche.' });
    }
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
    const existing = await Tache.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Tache not found' });
    }
    if (!(await isTacheInScope(existing, req.user))) {
      return res.status(403).json({ message: 'Accès refusé à cette tâche.' });
    }
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