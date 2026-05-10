const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['contrat', 'decision', 'requete', 'piece_jointe', 'correspondence', 'facture', 'autre'],
    default: 'autre'
  },
  mimeType: { type: String },
  chemin: { type: String, required: true },
  taille: { type: Number },
  dossierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dossier' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  estPrive: { type: Boolean, default: false },
  tags: [{ type: String }],
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Document', documentSchema);