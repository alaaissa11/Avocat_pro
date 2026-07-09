const mongoose = require('mongoose');

const historiqueTacheDocSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  nom: String,
  mimeType: String,
  chemin: String,
  taille: Number
});

const historiqueTacheSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  titre: String,
  description: String,
  assigneeA: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statut: String,
  priorite: Number,
  feedback: String,
  dateEcheance: Date,
  documents: [historiqueTacheDocSchema]
}, { _id: false });

const historiqueDossierSchema = new mongoose.Schema({
  dossier: {
    _id: mongoose.Schema.Types.ObjectId,
    numero: String,
    titre: String,
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    typeAffaire: String,
    priorite: Number,
    description: String,
    assigneA: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateCreation: Date,
    dateCloture: Date
  },
  taches: [historiqueTacheSchema],
  cloturePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HistoriqueDossier', historiqueDossierSchema);
