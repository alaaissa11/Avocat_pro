const HistoriqueDossier = require('../models/HistoriqueDossier');

exports.getHistorique = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = {};
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    const items = await HistoriqueDossier.find(query)
      .populate('dossier.clientId', 'nom prenom')
      .populate('dossier.assigneA', 'nom prenom')
      .populate('taches.assigneeA', 'nom prenom')
      .populate('cloturePar', 'nom prenom')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await HistoriqueDossier.countDocuments(query);

    res.json({
      historique: items,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching historique', error: error.message });
  }
};
