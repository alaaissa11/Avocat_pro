const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String },
  raisonSociale: { type: String },
  email: { type: String, required: true },
  telephone: { type: String, required: true },
  adresse: { type: String },
  ville: { type: String },
  codePostal: { type: String },
  pays: { type: String, default: 'Tunisie' },
  cin: { type: String },
  passport: { type: String },
  matriculeFiscal: { type: String },
  type: { type: String, enum: ['particulier', 'entreprise'], default: 'particulier' },
  profession: { type: String },
  observations: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Client', clientSchema);