const mongoose = require('mongoose');

const sousTypeSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String },
  delaisMoyens: { type: Number },
  piecesRequises: [{ type: String }],
  juridictionCompetente: { type: String }
}, { _id: false });

const typeAffaireSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  categorie: {
    type: String,
    enum: ['civil', 'penal', 'commercial', 'travail', 'famille', 'administratif', 'immobilier', 'bancaire', 'autre'],
    required: true
  },
  description: { type: String },
  delaisMoyens: { type: Number },
  piecesRequises: [{ type: String }],
  juridictionCompetente: { type: String },
  sousTypes: [sousTypeSchema],
  relations: [{ type: String }],
  actif: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('TypeAffaire', typeAffaireSchema);
