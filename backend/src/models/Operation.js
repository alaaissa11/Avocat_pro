const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'dossier_cree', 'dossier_modifie', 'dossier_cloture', 'dossier_archive',
      'client_cree', 'client_modifie',
      'document_uploade', 'document_modifie', 'document_supprime',
      'tache_cree', 'tache_modifiee', 'tache_terminee',
      'facture_cree', 'facture_modifiee', 'facture_payee',
      'utilisateur_connecte', 'utilisateur_cree', 'utilisateur_modifie',
      'calendrier_cree', 'calendrier_modifie', 'calendrier_supprime',
      'ia_prediction', 'export_donnees', 'autre'
    ],
    required: true
  },
  entiteType: {
    type: String,
    enum: ['dossier', 'client', 'document', 'tache', 'facture', 'user', 'calendrier', 'autre'],
    required: true
  },
  entiteId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  details: { type: String },
  anciennesValeurs: { type: mongoose.Schema.Types.Mixed },
  nouvellesValeurs: { type: mongoose.Schema.Types.Mixed },
  adresseIP: { type: String },
  userAgent: { type: String },
  meta: { type: mongoose.Schema.Types.Mixed },
  date: { type: Date, default: Date.now }
});

operationSchema.index({ entiteType: 1, entiteId: 1 });
operationSchema.index({ userId: 1, date: -1 });
operationSchema.index({ date: -1 });
operationSchema.index({ type: 1, date: -1 });

module.exports = mongoose.model('Operation', operationSchema);