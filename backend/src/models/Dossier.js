const mongoose = require('mongoose');

const dossierSchema = new mongoose.Schema({
  numero: { type: String, unique: true },
  titre: { type: String, required: true },
  description: { type: String },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  typeAffaire: {
    type: String,
    enum: ['civil', 'penal', 'commercial', 'travail', 'famille', 'administratif', 'immobilier', 'bancaire', 'autre'],
    required: true
  },
  sousType: { type: String },
  statut: {
    type: String,
    enum: ['nouveau', 'en_cours', 'en_attente', 'cloture', 'archive'],
    default: 'nouveau'
  },
  priorite: { type: Number, min: 1, max: 5, default: 3 },
  assigneA: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collaboreurs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  chargeEstimee: { type: Number, default: 0 },
  chargeConsommee: { type: Number, default: 0 },
  dateCreation: { type: Date, default: Date.now },
  dateAudience: { type: Date },
  dateCloture: { type: Date },
  numeroRG: { type: String },
  numeroDecision: { type: String },
  juridiction: { type: String },
  adversary: {
    nom: { type: String },
    avocat: { type: String },
    email: { type: String }
  },
  iaPrediction: {
    categorieSuggeree: { type: String },
    confiance: { type: Number },
    datePrediction: { type: Date }
  },
  historique: [{
    action: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    details: { type: String },
    previousValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

dossierSchema.pre('save', async function(next) {
  if (!this.numero) {
    const count = await mongoose.model('Dossier').countDocuments();
    this.numero = `DOS-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

dossierSchema.methods.addToHistory = function(action, userId, details, previousValue, newValue) {
  this.historique.push({ action, userId, details, previousValue, newValue, date: new Date() });
};

module.exports = mongoose.model('Dossier', dossierSchema);