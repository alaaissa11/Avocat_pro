const mongoose = require('mongoose');

const tacheSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String },
  dossierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dossier' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  assigneeA: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priorite: { type: Number, min: 1, max: 5, default: 3 },
  statut: {
    type: String,
    enum: ['a_faire', 'en_cours', 'terminee', 'annulee'],
    default: 'a_faire'
  },
  dateEcheance: { type: Date },
  dateDebut: { type: Date },
  dateFin: { type: Date },
  chargeEstimee: { type: Number },
  chargeConsommee: { type: Number, default: 0 },
  estRecurrente: { type: Boolean, default: false },
  periodicite: {
    frequence: { type: String, enum: ['journalier', 'hebdomadaire', 'mensuel', 'annuel'] },
    jourSemaine: { type: Number },
    jourMois: { type: Number },
    finPeriodicite: { type: Date }
  },
  rappels: [{
    dateRappel: { type: Date },
    notifie: { type: Boolean, default: false },
    canaux: [{ type: String, enum: ['email', 'sms', 'notification'] }]
  }],
  commentaire: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tacheSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Tache', tacheSchema);