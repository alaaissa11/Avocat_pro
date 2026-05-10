const mongoose = require('mongoose');

const calendrierSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['audience', 'rendez_vous', 'echeance', 'conge', 'formation', 'autre'],
    required: true
  },
  dossierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dossier' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  estJourEntier: { type: Boolean, default: false },
  lieu: { type: String },
  lienVisio: { type: String },
  rappel: {
    actif: { type: Boolean, default: false },
    delaiMinutes: { type: Number }
  },
  priorite: { type: Number, min: 1, max: 5, default: 3 },
  couleur: { type: String },
  statut: {
    type: String,
    enum: ['planifie', 'confirme', 'annule', 'termine'],
    default: 'planifie'
  },
  estPrive: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

calendrierSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Calendrier', calendrierSchema);