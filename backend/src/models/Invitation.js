const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  statut: {
    type: String,
    enum: ['en_attente', 'acceptee', 'refusee'],
    default: 'en_attente'
  },
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date }
});

invitationSchema.index({ sender: 1, statut: 1 });
invitationSchema.index({ receiver: 1, statut: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);
