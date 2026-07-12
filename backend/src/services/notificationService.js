const Notification = require('../models/Notification');
const User = require('../models/User');
const Dossier = require('../models/Dossier');
const Tache = require('../models/Tache');

const notifyUser = async (receiverId, type, title, message, referenceType, referenceId) => {
  try {
    if (!receiverId) return null;
    const notif = new Notification({ receiver: receiverId, type, title, message, referenceType, referenceId });
    await notif.save();
    return notif;
  } catch (err) {
    console.error('[Notification] Error creating notification:', err.message);
    return null;
  }
};

const notifyOperation = async (operation) => {
  try {
    const { type, entiteType, entiteId, userId, details } = operation;
    const actor = userId ? await User.findById(userId).select('nom prenom role') : null;
    const actorName = actor ? `${actor.prenom} ${actor.nom}` : 'Système';
    let receivers = [];

    if (entiteType === 'dossier' && entiteId) {
      const dossier = await Dossier.findById(entiteId).populate('assigneA', '_id').populate('collaboreurs', '_id');
      if (dossier) {
        const ids = [];
        if (dossier.assigneA) ids.push(dossier.assigneA._id.toString());
        dossier.collaboreurs?.forEach(c => ids.push(c._id.toString()));
        receivers = [...new Set(ids)].filter(id => id !== userId?.toString());
      }
    } else if (entiteType === 'tache' && entiteId) {
      const tache = await Tache.findById(entiteId);
      if (tache && tache.assigneA && tache.assigneA.toString() !== userId?.toString()) {
        receivers = [tache.assigneA];
      }
    }

    const typeLabels = {
      dossier_cree: 'Dossier créé', dossier_modifie: 'Dossier modifié', dossier_cloture: 'Dossier clôturé',
      client_cree: 'Client créé', client_modifie: 'Client modifié',
      document_uploade: 'Document uploadé', document_modifie: 'Document modifié', document_supprime: 'Document supprimé',
      tache_cree: 'Tâche créée', tache_modifiee: 'Tâche modifiée', tache_terminee: 'Tâche terminée',
      calendrier_cree: 'Événement créé', calendrier_modifie: 'Événement modifié', calendrier_supprime: 'Événement supprimé',
      utilisateur_cree: 'Nouvel utilisateur', utilisateur_modifie: 'Utilisateur modifié',
    };
    const title = typeLabels[type] || 'Opération';
    const message = details || `${actorName} a effectué une opération`;

    for (const rid of receivers) {
      await notifyUser(rid, 'operation', title, message, 'operation', operation._id);
    }
  } catch (err) {
    console.error('[Notification] notifyOperation error:', err.message);
  }
};

const notifyMessage = async (message) => {
  try {
    const senderId = message.sender?._id || message.sender;
    const receiverId = message.receiver?._id || message.receiver;
    const senderName = message.sender?.prenom
      ? `${message.sender.prenom} ${message.sender.nom}`
      : 'Quelqu\'un';
    await notifyUser(
      receiverId,
      'message',
      'Nouveau message',
      `${senderName} vous a envoyé un message`,
      'message',
      message._id
    );
  } catch (err) {
    console.error('[Notification] notifyMessage error:', err.message);
  }
};

module.exports = { notifyOperation, notifyMessage, notifyUser };
