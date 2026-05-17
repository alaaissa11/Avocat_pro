const Document = require('../models/Document');
const Operation = require('../models/Operation');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

exports.uploadDocument = async (req, res) => {
  try {
    console.log('[Document] Requête reçue');
    console.log('[Document] File:', req.file ? req.file.originalname : 'Aucun fichier');
    console.log('[Document] Body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { dossierId, clientId, description, type, estPrive, tags } = req.body;

    console.log('[Document] Données:', { dossierId, clientId, description, type });

    const document = new Document({
      nom: req.file.originalname,
      description,
      type: type || 'autre',
      mimeType: req.file.mimetype,
      chemin: req.file.path,
      taille: req.file.size,
      dossierId: dossierId || undefined,
      clientId: clientId || undefined,
      uploadedBy: req.user._id,
      estPrive: estPrive === 'true',
      tags: tags ? JSON.parse(tags) : []
    });

    await document.save();

    await new Operation({
      type: 'document_uploade',
      entiteType: 'document',
      entiteId: document._id,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `Document ${document.nom} uploaded`
    }).save();

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, dossierId, clientId } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) query.type = type;
    if (dossierId) query.dossierId = dossierId;
    if (clientId) query.clientId = clientId;

    const documents = await Document.find(query)
      .populate('uploadedBy', 'nom prenom')
      .populate('dossierId', 'numero titre')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'nom prenom')
      .populate('dossierId')
      .populate('clientId');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!fs.existsSync(document.chemin)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    res.download(document.chemin, document.nom);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading document', error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (document && fs.existsSync(document.chemin)) {
      fs.unlinkSync(document.chemin);
    }

    await Document.findByIdAndDelete(req.params.id);

    await new Operation({
      type: 'document_supprime',
      entiteType: 'document',
      entiteId: req.params.id,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `Document deleted`
    }).save();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
};