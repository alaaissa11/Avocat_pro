const Delegation = require('../models/Delegation');
const { notifyUser } = require('../services/notificationService');

exports.createDelegation = async (req, res) => {
  try {
    const { entiteType, entiteId, delegueA, motif, dateFin } = req.body;
    if (!entiteType || !entiteId || !delegueA) {
      return res.status(400).json({ message: 'Champs obligatoires : entiteType, entiteId, delegueA' });
    }
    if (req.user._id.toString() === delegueA) {
      return res.status(400).json({ message: 'Impossible de déléguer à soi-même' });
    }
    const existante = await Delegation.findOne({
      entiteType, entiteId, statut: { $in: ['en_attente', 'acceptee'] }
    });
    if (existante) {
      return res.status(400).json({ message: 'Une délégation est déjà active ou en attente pour cette entité' });
    }
    const delegation = new Delegation({
      entiteType, entiteId, deleguePar: req.user._id, delegueA, motif, dateFin
    });
    await delegation.save();
    const populated = await Delegation.findById(delegation._id)
      .populate('deleguePar', 'nom prenom email')
      .populate('delegueA', 'nom prenom email');
    await notifyUser(
      delegueA, 'delegation', 'Délégation reçue',
      `${req.user.prenom} ${req.user.nom} vous a délégué ${entiteType === 'dossier' ? 'un dossier' : 'une tâche'}`,
      'delegation', delegation._id
    );
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la délégation', error: error.message });
  }
};

exports.acceptDelegation = async (req, res) => {
  try {
    const delegation = await Delegation.findById(req.params.id);
    if (!delegation) return res.status(404).json({ message: 'Délégation non trouvée' });
    if (delegation.delegueA.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Seul le destinataire peut accepter' });
    }
    if (delegation.statut !== 'en_attente') {
      return res.status(400).json({ message: 'Délégation déjà traitée' });
    }
    delegation.statut = 'acceptee';
    await delegation.save();
    const populated = await Delegation.findById(delegation._id)
      .populate('deleguePar', 'nom prenom')
      .populate('delegueA', 'nom prenom');
    await notifyUser(
      delegation.deleguePar, 'delegation', 'Délégation acceptée',
      `${req.user.prenom} ${req.user.nom} a accepté votre délégation`,
      'delegation', delegation._id
    );
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

exports.refuseDelegation = async (req, res) => {
  try {
    const delegation = await Delegation.findById(req.params.id);
    if (!delegation) return res.status(404).json({ message: 'Délégation non trouvée' });
    if (delegation.delegueA.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Seul le destinataire peut refuser' });
    }
    if (delegation.statut !== 'en_attente') {
      return res.status(400).json({ message: 'Délégation déjà traitée' });
    }
    delegation.statut = 'refusee';
    await delegation.save();
    const populated = await Delegation.findById(delegation._id)
      .populate('deleguePar', 'nom prenom')
      .populate('delegueA', 'nom prenom');
    await notifyUser(
      delegation.deleguePar, 'delegation', 'Délégation refusée',
      `${req.user.prenom} ${req.user.nom} a refusé votre délégation`,
      'delegation', delegation._id
    );
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

exports.terminerDelegation = async (req, res) => {
  try {
    const delegation = await Delegation.findById(req.params.id);
    if (!delegation) return res.status(404).json({ message: 'Délégation non trouvée' });
    const userId = req.user._id.toString();
    if (delegation.deleguePar.toString() !== userId && delegation.delegueA.toString() !== userId) {
      return res.status(403).json({ message: 'Seul le délégant ou le délégué peut terminer' });
    }
    if (delegation.statut !== 'acceptee') {
      return res.status(400).json({ message: 'Seule une délégation acceptée peut être terminée' });
    }
    delegation.statut = 'terminee';
    delegation.dateFin = new Date();
    await delegation.save();
    const populated = await Delegation.findById(delegation._id)
      .populate('deleguePar', 'nom prenom')
      .populate('delegueA', 'nom prenom');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

exports.getReceived = async (req, res) => {
  try {
    const delegations = await Delegation.find({ delegueA: req.user._id })
      .populate('deleguePar', 'nom prenom email')
      .populate('delegueA', 'nom prenom email')
      .sort({ createdAt: -1 });
    res.json(delegations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

exports.getSent = async (req, res) => {
  try {
    const delegations = await Delegation.find({ deleguePar: req.user._id })
      .populate('deleguePar', 'nom prenom email')
      .populate('delegueA', 'nom prenom email')
      .sort({ createdAt: -1 });
    res.json(delegations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

exports.getEntityDelegation = async (req, res) => {
  try {
    const { entiteType, entiteId } = req.params;
    const delegation = await Delegation.findOne({
      entiteType, entiteId, statut: { $in: ['en_attente', 'acceptee'] }
    }).populate('deleguePar', 'nom prenom').populate('delegueA', 'nom prenom');
    res.json(delegation);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};
