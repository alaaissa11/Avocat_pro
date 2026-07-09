const Message = require('../models/Message');
const User = require('../models/User');

const canMessageUser = async (sender, receiverId) => {
  if (sender.role === 'admin') return true;
  const receiver = await User.findById(receiverId);
  if (!receiver) return false;
  if (sender.role === 'avocat') {
    return ['collaborateur', 'assistant', 'secretaire'].includes(receiver.role) ||
           receiver.ownerId?.toString() === sender._id.toString();
  }
  if (['collaborateur', 'assistant', 'secretaire'].includes(sender.role)) {
    return ['avocat', 'admin'].includes(receiver.role) ||
           sender.ownerId?.toString() === receiver._id.toString();
  }
  return false;
};

exports.envoyerMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ message: 'Destinataire et contenu requis' });
    }
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous envoyer un message à vous-même' });
    }
    if (!(await canMessageUser(req.user, receiverId))) {
      return res.status(403).json({ message: 'Vous ne pouvez pas envoyer de message à cet utilisateur' });
    }
    const message = new Message({ sender: req.user._id, receiver: receiverId, content: content.trim() });
    await message.save();
    const populated = await Message.findById(message._id)
      .populate('sender', 'nom prenom role')
      .populate('receiver', 'nom prenom role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi', error: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'nom prenom role')
      .populate('receiver', 'nom prenom role')
      .sort({ createdAt: -1 })
      .lean();

    const conversationsMap = new Map();
    for (const msg of messages) {
      const otherId = msg.sender._id.toString() === userId.toString()
        ? msg.receiver._id.toString()
        : msg.sender._id.toString();
      const other = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          user: other,
          lastMessage: msg,
          unread: !msg.lu && msg.receiver._id.toString() === userId.toString() ? 1 : 0
        });
      } else {
        const conv = conversationsMap.get(otherId);
        if (!msg.lu && msg.receiver._id.toString() === userId.toString()) {
          conv.unread++;
        }
      }
    }

    res.json(Array.from(conversationsMap.values()));
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des conversations', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { with: otherUserId } = req.params;
    if (!otherUserId) {
      return res.status(400).json({ message: 'Paramètre "with" requis' });
    }
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
      .populate('sender', 'nom prenom role')
      .populate('receiver', 'nom prenom role')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: otherUserId, receiver: userId, lu: false },
      { lu: true, luAt: new Date() }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des messages', error: error.message });
  }
};

exports.markAsLu = async (req, res) => {
  try {
    const { with: otherUserId } = req.params;
    await Message.updateMany(
      { sender: otherUserId, receiver: req.user._id, lu: false },
      { lu: true, luAt: new Date() }
    );
    res.json({ message: 'Messages marqués comme lus' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};
