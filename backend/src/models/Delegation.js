const mongoose = require('mongoose');

const delegationSchema = new mongoose.Schema({
  entiteType: { type: String, enum: ['dossier', 'tache'], required: true },
  entiteId: { type: mongoose.Schema.Types.ObjectId, required: true },
  deleguePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  delegueA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateDebut: { type: Date, default: Date.now },
  dateFin: { type: Date },
  statut: { type: String, enum: ['en_attente', 'acceptee', 'refusee', 'terminee'], default: 'en_attente' },
  motif: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Delegation', delegationSchema);
