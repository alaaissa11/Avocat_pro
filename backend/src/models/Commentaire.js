const mongoose = require('mongoose');

const commentaireSchema = new mongoose.Schema({
  entiteType: { type: String, enum: ['dossier', 'tache'], required: true },
  entiteId: { type: mongoose.Schema.Types.ObjectId, required: true },
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contenu: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Commentaire', commentaireSchema);
