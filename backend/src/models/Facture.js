const mongoose = require('mongoose');

const factureSchema = new mongoose.Schema({
  numero: { type: String, unique: true },
  type: { type: String, enum: ['facture', 'avoir', 'devis'], default: 'facture' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  dossierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dossier' },
  dateEmission: { type: Date, default: Date.now },
  dateEcheance: { type: Date },
  dateReglement: { type: Date },
  statut: {
    type: String,
    enum: ['brouillon', 'envoyee', 'payee', 'annulee', 'en_retard'],
    default: 'brouillon'
  },
  modeReglement: {
    type: String,
    enum: ['espece', 'virement', 'cheque', 'carte_bancaire', 'autre']
  },
  articles: [{
    description: { type: String, required: true },
    quantite: { type: Number, required: true },
    prixUnitaire: { type: Number, required: true },
    tauxTVA: { type: Number, default: 19 },
    montantHT: { type: Number },
    montantTVA: { type: Number },
    montantTTC: { type: Number }
  }],
  totalHT: { type: Number, default: 0 },
  totalTVA: { type: Number, default: 0 },
  totalTTC: { type: Number, default: 0 },
  montantPaye: { type: Number, default: 0 },
  resteAPayer: { type: Number, default: 0 },
  notes: { type: String },
  conditionReglement: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  historique: [{
    action: { type: String },
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: String }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

factureSchema.pre('save', async function(next) {
  if (!this.numero) {
    const count = await mongoose.model('Facture').countDocuments();
    this.numero = `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }

  this.articles.forEach(article => {
    article.montantHT = article.quantite * article.prixUnitaire;
    article.montantTVA = article.montantHT * (article.tauxTVA / 100);
    article.montantTTC = article.montantHT + article.montantTVA;
  });

  this.totalHT = this.articles.reduce((sum, a) => sum + a.montantHT, 0);
  this.totalTVA = this.articles.reduce((sum, a) => sum + a.montantTVA, 0);
  this.totalTTC = this.articles.reduce((sum, a) => sum + a.montantTTC, 0);
  this.resteAPayer = this.totalTTC - this.montantPaye;

  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Facture', factureSchema);