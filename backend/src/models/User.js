const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'avocat', 'collaborateur', 'assistant', 'secretaire'],
    default: 'assistant'
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'manage_users', 'manage_dossiers', 'manage_clients', 'view_stats']
  }],
  telephone: { type: String },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  statut: { type: String, enum: ['actif', 'conge', 'indisponible'], default: 'actif' },
  lastLogin: { type: Date },
  // Hiérarchie : ownerId pointe vers le user qui a créé ce user.
  // - admin (avocat@avocat-pro.tn) : ownerId = null
  // - avocat créé par admin : ownerId = admin._id
  // - collaborateur créé par avocat : ownerId = avocat._id
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);