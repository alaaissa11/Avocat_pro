const Operation = require('../models/Operation');

exports.getOperations = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, entiteType, userId, dateDebut, dateFin } = req.query;
    const query = {};

    if (type) query.type = type;
    if (entiteType) query.entiteType = entiteType;
    if (userId) query.userId = userId;

    if (dateDebut || dateFin) {
      query.date = {};
      if (dateDebut) query.date.$gte = new Date(dateDebut);
      if (dateFin) query.date.$lte = new Date(dateFin);
    }

    const operations = await Operation.find(query)
      .populate('userId', 'nom prenom email')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Operation.countDocuments(query);

    res.json({
      operations,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching operations', error: error.message });
  }
};

exports.getOperationsByEntity = async (req, res) => {
  try {
    const { entiteType, entiteId } = req.params;
    const operations = await Operation.find({ entiteType, entiteId })
      .populate('userId', 'nom prenom')
      .sort({ date: -1 });
    res.json(operations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entity operations', error: error.message });
  }
};

exports.getTraceabilite = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (userId) query.userId = userId;

    const operations = await Operation.find(query)
      .populate('userId', 'nom prenom')
      .sort({ date: -1 })
      .limit(100);

    res.json(operations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching traceabilite', error: error.message });
  }
};

exports.getAuditLog = async (req, res) => {
  try {
    const logs = await Operation.find()
      .populate('userId', 'nom prenom role')
      .sort({ date: -1 })
      .limit(50);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit log', error: error.message });
  }
};