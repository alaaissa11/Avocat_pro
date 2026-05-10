const mongoose = require('mongoose');

const collaborateurSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matricule: { type: String, unique: true },
  dateEmbauche: { type: Date },
  specialite: [{ type: String }],
  tauxHoraire: { type: Number },
  objectifs: {
    heuresMensuel: { type: Number },
    dossiersMensuel: { type: Number },
    chiffreAffaire: { type: Number }
  },
  performance: {
    totalHeuresTravailles: { type: Number, default: 0 },
    totalDossiersTraites: { type: Number, default: 0 },
    dossiersClotures: { type: Number, default: 0 },
    noteMoyenne: { type: Number, default: 0 },
    historiqueNotes: [{
      date: { type: Date },
      note: { type: Number },
      commentaire: { type: String }
    }]
  },
  statistiques: [{
    mois: { type: String },
    annee: { type: Number },
    heuresTravailles: { type: Number },
    dossiersOuverts: { type: Number },
    dossiersClotures: { type: Number },
    chargeEstimee: { type: Number },
    chargeConsommee: { type: Number }
  }],
  conges: [{
    type: { type: String, enum: ['conge_paye', 'conge_maladie', 'conge_sans_solde', 'autre'] },
    dateDebut: { type: Date },
    dateFin: { type: Date },
    duree: { type: Number },
    statut: { type: String, enum: ['approuve', 'en_attente', 'refuse'] }
  }],
  estActif: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

collaborateurSchema.pre('save', async function(next) {
  if (!this.matricule) {
    const count = await mongoose.model('Collaborateur').countDocuments();
    this.matricule = `COL-${String(count + 1).padStart(4, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Collaborateur', collaborateurSchema);