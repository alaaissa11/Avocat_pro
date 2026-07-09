const mongoose = require('mongoose');
const Document = require('../models/Document');
const Tache = require('../models/Tache');
const Operation = require('../models/Operation');
const Dossier = require('../models/Dossier');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const buildDocumentScopeForUser = async (user) => {
  if (user.role === 'admin') return {};

  const userId = user._id;
  const dossierScope = {
    $or: [
      { assigneA: userId },
      { collaboreurs: userId },
      { createdBy: userId }
    ]
  };

  const userDossiers = await Dossier.find(dossierScope).select('_id').lean();
  const dossierIds = userDossiers.map(d => d._id);

  const userTaches = await Tache.find({ assigneeA: userId }).select('_id').lean();
  const tacheIds = userTaches.map(t => t._id);

  const conditions = [
    { uploadedBy: userId }
  ];

  if (dossierIds.length > 0) {
    conditions.push({ dossierId: { $in: dossierIds } });
  }

  if (tacheIds.length > 0) {
    conditions.push({ tacheId: { $in: tacheIds } });
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { $or: conditions };
};

const isDocumentInScope = async (doc, user) => {
  if (user.role === 'admin') return true;
  if (!doc) return false;
  if (doc.uploadedBy && doc.uploadedBy.toString() === user._id.toString()) return true;
  if (doc.tacheId) {
    const tache = await Tache.findById(doc.tacheId);
    if (tache && tache.assigneeA && tache.assigneeA.toString() === user._id.toString()) return true;
  }
  if (doc.dossierId) {
    const dossier = await Dossier.findById(doc.dossierId);
    if (dossier) {
      if (dossier.assigneA?.toString() === user._id.toString()) return true;
      if (dossier.createdBy?.toString() === user._id.toString()) return true;
      if (dossier.collaboreurs?.some(id => id.toString() === user._id.toString())) return true;
    }
  }
  return false;
};

exports.uploadDocument = async (req, res) => {
  try {
    console.log('=== UPLOAD DOCUMENT START ===');
    console.log('req.file:', req.file ? req.file.originalname : 'AUCUN FICHIER');
    console.log('req.user:', req.user);
    console.log('req.headers.authorization:', req.headers.authorization ? 'présent' : 'absent');
    
    if (!req.file) {
      console.log('ERROR: No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!req.user || !req.user._id) {
      console.log('ERROR: User not authenticated');
      console.log('req.user:', req.user);
      return res.status(401).json({ message: 'Utilisateur non connecté' });
    }

    const { dossierId, tacheId, clientId, description, type, estPrive, tags } = req.body;

    console.log('[Document] Données:', { dossierId, tacheId, clientId, description, type });

    let resolvedDossierId = dossierId && dossierId !== 'undefined' ? new mongoose.Types.ObjectId(dossierId) : undefined;

    if (!resolvedDossierId && tacheId && tacheId !== 'undefined') {
      const tache = await Tache.findById(tacheId).select('dossierId').lean();
      if (tache && tache.dossierId) {
        resolvedDossierId = tache.dossierId;
      }
    }

    let parsedTags = [];
    try {
      parsedTags = tags ? JSON.parse(tags) : [];
    } catch (e) {
      console.log('[Document] Tags parsing error:', e.message);
    }

    const document = new Document({
      nom: req.file.originalname,
      description,
      type: type || 'autre',
      mimeType: req.file.mimetype,
      chemin: req.file.path,
      taille: req.file.size,
      dossierId: resolvedDossierId,
      tacheId: tacheId && tacheId !== 'undefined' ? new mongoose.Types.ObjectId(tacheId) : undefined,
      clientId: clientId && clientId !== 'undefined' ? new mongoose.Types.ObjectId(clientId) : undefined,
      uploadedBy: req.user._id,
      estPrive: estPrive === 'true',
      tags: parsedTags
    });

    console.log('[Document] Saving with dossierId:', dossierId, 'type:', typeof dossierId);

    await document.save();
    console.log('[Document] Document saved:', document._id);

    await new Operation({
      type: 'document_uploade',
      entiteType: 'document',
      entiteId: document._id,
      userId: req.user._id,
      userEmail: req.user.email || '',
      details: `Document ${document.nom} uploaded`
    }).save();

    console.log('[Document] Upload successful');
    res.status(201).json(document);
  } catch (error) {
    console.error('[Document] Error:', error);
    res.status(500).json({ message: 'Error uploading document', error: error.message, stack: error.stack });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, dossierId, tacheId, clientId, sansTache } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) query.type = type;
    if (dossierId) {
      query.dossierId = new mongoose.Types.ObjectId(dossierId);
    }
    if (tacheId) {
      query.tacheId = new mongoose.Types.ObjectId(tacheId);
    }
    if (clientId) query.clientId = clientId;
    if (sansTache === 'true') {
      query.tacheId = { $exists: false };
    }

    const scope = await buildDocumentScopeForUser(req.user);
    
    if (Object.keys(scope).length > 0) {
      if (query.$or) {
        query.$and = [{ $or: query.$or }, scope];
        delete query.$or;
      } else {
        Object.assign(query, scope);
      }
    }

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
    if (!(await isDocumentInScope(document, req.user))) {
      return res.status(403).json({ message: 'Accès refusé à ce document.' });
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
    if (!(await isDocumentInScope(document, req.user))) {
      return res.status(403).json({ message: 'Accès refusé à ce document.' });
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

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    if (!(await isDocumentInScope(document, req.user))) {
      return res.status(403).json({ message: 'Accès refusé à ce document.' });
    }

    if (fs.existsSync(document.chemin)) {
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