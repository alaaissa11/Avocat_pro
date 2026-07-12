const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Operation = require('../models/Operation');
const { notifyUser } = require('../services/notificationService');

exports.sendInvitation = async (req, res) => {
  try {
    if (req.user.role !== 'avocat') {
      return res.status(403).json({ message: 'Seuls les avocats peuvent envoyer des invitations.' });
    }
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ message: 'receiverId requis' });
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous inviter vous-même.' });
    }
    const receiver = await User.findById(receiverId).select('role statut ownerId nom prenom');
    if (!receiver) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (!['collaborateur', 'assistant', 'secretaire'].includes(receiver.role)) {
      return res.status(400).json({ message: 'Vous ne pouvez inviter que des collaborateurs, assistants ou secrétaires.' });
    }
    if (receiver.statut === 'conge' || receiver.statut === 'indisponible') {
      return res.status(400).json({ message: 'Cet utilisateur est en congé ou indisponible. Impossible de l\'inviter.' });
    }
    if (receiver.ownerId) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà dans une équipe.' });
    }
    const existing = await Invitation.findOne({ sender: req.user._id, receiver: receiverId, statut: 'en_attente' });
    if (existing) {
      return res.status(400).json({ message: 'Une invitation en attente existe déjà pour cet utilisateur.' });
    }
    const invitation = new Invitation({ sender: req.user._id, receiver: receiverId });
    await invitation.save();

    await new Operation({
      type: 'utilisateur_modifie',
      entiteType: 'user',
      entiteId: receiverId,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `${req.user.prenom} ${req.user.nom} a invité ${receiver.prenom} ${receiver.nom} dans son équipe`
    }).save();

    await notifyUser(
      receiverId,
      'operation',
      'Invitation à rejoindre une équipe',
      `${req.user.prenom} ${req.user.nom} vous invite à rejoindre son équipe.`,
      'invitation',
      invitation._id
    );

    const populated = await Invitation.findById(invitation._id)
      .populate('sender', 'nom prenom email role')
      .populate('receiver', 'nom prenom email role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'invitation', error: error.message });
  }
};

exports.acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id).populate('sender', '_id');
    if (!invitation) return res.status(404).json({ message: 'Invitation introuvable.' });
    if (invitation.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cette invitation ne vous est pas destinée.' });
    }
    if (invitation.statut !== 'en_attente') {
      return res.status(400).json({ message: 'Cette invitation n\'est plus en attente.' });
    }
    const receiver = await User.findById(req.user._id).select('statut ownerId');
    if (receiver.statut === 'conge' || receiver.statut === 'indisponible') {
      return res.status(400).json({ message: 'Vous êtes en congé ou indisponible. Contactez votre superviseur.' });
    }

    receiver.ownerId = invitation.sender._id;
    await receiver.save();
    invitation.statut = 'acceptee';
    invitation.respondedAt = new Date();
    await invitation.save();

    await new Operation({
      type: 'utilisateur_modifie',
      entiteType: 'user',
      entiteId: receiver._id,
      userId: receiver._id,
      userEmail: req.user.email,
      details: `${req.user.prenom} ${req.user.nom} a accepté l'invitation`
    }).save();

    const populated = await Invitation.findById(invitation._id)
      .populate('sender', 'nom prenom email role')
      .populate('receiver', 'nom prenom email role');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'acceptation', error: error.message });
  }
};

exports.rejectInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ message: 'Invitation introuvable.' });
    if (invitation.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cette invitation ne vous est pas destinée.' });
    }
    if (invitation.statut !== 'en_attente') {
      return res.status(400).json({ message: 'Cette invitation n\'est plus en attente.' });
    }
    invitation.statut = 'refusee';
    invitation.respondedAt = new Date();
    await invitation.save();
    res.json({ message: 'Invitation refusée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

exports.getReceivedInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ receiver: req.user._id })
      .populate('sender', 'nom prenom email role')
      .sort({ createdAt: -1 });
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

exports.getSentInvitations = async (req, res) => {
  try {
    if (req.user.role !== 'avocat') {
      return res.status(403).json({ message: 'Seuls les avocats peuvent voir leurs invitations envoyées.' });
    }
    const invitations = await Invitation.find({ sender: req.user._id })
      .populate('receiver', 'nom prenom email role')
      .sort({ createdAt: -1 });
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};
