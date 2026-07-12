const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['operation', 'message', 'task', 'dossier', 'document', 'system'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  referenceType: { type: String },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  lu: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ receiver: 1, lu: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
