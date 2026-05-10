const Facture = require('../models/Facture');
const Operation = require('../models/Operation');

exports.createFacture = async (req, res) => {
  try {
    const facture = new Facture({ ...req.body, createdBy: req.user._id });
    await facture.save();

    await new Operation({
      type: 'facture_cree',
      entiteType: 'facture',
      entiteId: facture._id,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `Facture ${facture.numero} created`
    }).save();

    res.status(201).json(facture);
  } catch (error) {
    res.status(500).json({ message: 'Error creating facture', error: error.message });
  }
};

exports.getFactures = async (req, res) => {
  try {
    const { page = 1, limit = 10, clientId, statut, type } = req.query;
    const query = {};

    if (clientId) query.clientId = clientId;
    if (statut) query.statut = statut;
    if (type) query.type = type;

    const factures = await Facture.find(query)
      .populate('clientId', 'nom prenom raisonSociale')
      .populate('dossierId', 'numero titre')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Facture.countDocuments(query);

    res.json({
      factures,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching factures', error: error.message });
  }
};

exports.getFactureById = async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id)
      .populate('clientId')
      .populate('dossierId')
      .populate('createdBy', 'nom prenom');

    if (!facture) {
      return res.status(404).json({ message: 'Facture not found' });
    }
    res.json(facture);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching facture', error: error.message });
  }
};

exports.updateFacture = async (req, res) => {
  try {
    const oldFacture = await Facture.findById(req.params.id);
    const facture = await Facture.findByIdAndUpdate(req.params.id, req.body, { new: true });

    facture.historique.push({
      action: 'modification',
      userId: req.user._id,
      details: 'Facture modifiée'
    });
    await facture.save();

    await new Operation({
      type: 'facture_modifiee',
      entiteType: 'facture',
      entiteId: facture._id,
      userId: req.user._id,
      userEmail: req.user.email,
      anciennesValeurs: oldFacture,
      nouvellesValeurs: facture,
      details: `Facture ${facture.numero} modified`
    }).save();

    res.json(facture);
  } catch (error) {
    res.status(500).json({ message: 'Error updating facture', error: error.message });
  }
};

exports.payerFacture = async (req, res) => {
  try {
    const { montantPaye, modeReglement } = req.body;
    const facture = await Facture.findById(req.params.id);

    facture.montantPaye += montantPaye;
    if (facture.montantPaye >= facture.totalTTC) {
      facture.statut = 'payee';
      facture.dateReglement = new Date();
    } else if (facture.montantPaye > 0) {
      facture.statut = 'envoyee';
    }

    if (modeReglement) facture.modeReglement = modeReglement;
    await facture.save();

    await new Operation({
      type: 'facture_payee',
      entiteType: 'facture',
      entiteId: facture._id,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `Facture ${facture.numero} - Payment: ${montantPaye} DT`
    }).save();

    res.json(facture);
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
};

exports.deleteFacture = async (req, res) => {
  try {
    await Facture.findByIdAndDelete(req.params.id);
    res.json({ message: 'Facture deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting facture', error: error.message });
  }
};

exports.getStatsFacturation = async (req, res) => {
  try {
    const totalFactures = await Facture.countDocuments();
    const totalHT = await Facture.aggregate([{ $group: { _id: null, total: { $sum: '$totalHT' } } }]);
    const totalTTC = await Facture.aggregate([{ $group: { _id: null, total: { $sum: '$totalTTC' } } }]);
    const totalPaye = await Facture.aggregate([{ $group: { _id: null, total: { $sum: '$montantPaye' } } }]);

    const byMonth = await Facture.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$dateEmission' } },
          totalHT: { $sum: '$totalHT' },
          totalTTC: { $sum: '$totalTTC' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalFactures,
      totalHT: totalHT[0]?.total || 0,
      totalTTC: totalTTC[0]?.total || 0,
      totalPaye: totalPaye[0]?.total || 0,
      byMonth
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};