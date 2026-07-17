const mongoose = require('mongoose');

const parametrageSchema = new mongoose.Schema({
  cle: { type: String, required: true, unique: true },
  valeur: { type: mongoose.Schema.Types.Mixed },
  description: { type: String },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'array', 'object'],
    default: 'string'
  },
  categorie: {
    type: String,
    enum: ['general', 'dossier', 'client', 'facturation', 'notification', 'ia', 'securite'],
    default: 'general'
  },
  modifiable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

parametrageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

parametrageSchema.statics.getValue = async function(cle, valeurParDefaut = null) {
  const param = await this.findOne({ cle });
  return param ? param.valeur : valeurParDefaut;
};

parametrageSchema.statics.setValue = async function(cle, valeur, description = '') {
  return await this.findOneAndUpdate(
    { cle },
    { cle, valeur, description, updatedAt: Date.now() },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('Parametrage', parametrageSchema);