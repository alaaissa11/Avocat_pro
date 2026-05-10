const User = require('../models/User');
const Collaborateur = require('../models/Collaborateur');
const Operation = require('../models/Operation');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, permissions, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, permissions, isActive },
      { new: true }
    ).select('-password');

    await new Operation({
      type: 'utilisateur_modifie',
      entiteType: 'user',
      entiteId: user._id,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `User ${user.email} updated`
    }).save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

exports.getCollaborateurs = async (req, res) => {
  try {
    const collaborateurs = await Collaborateur.find()
      .populate('userId', 'nom prenom email role')
      .sort({ createdAt: -1 });
    res.json(collaborateurs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collaborateurs', error: error.message });
  }
};

exports.getCollaborateurStats = async (req, res) => {
  try {
    const collaborateur = await Collaborateur.findOne({ userId: req.params.id });
    if (!collaborateur) {
      return res.status(404).json({ message: 'Collaborateur not found' });
    }
    res.json(collaborateur.performance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

exports.updateCollaborateurPerformance = async (req, res) => {
  try {
    const { heures, dossiersTraites, note, commentaire } = req.body;
    const collaborateur = await Collaborateur.findOne({ userId: req.params.id });

    collaborateur.performance.totalHeuresTravailles += heures || 0;
    collaborateur.performance.totalDossiersTraites += dossiersTraites || 0;
    collaborateur.performance.historiqueNotes.push({ date: new Date(), note, commentaire });

    const avgNote = collaborateur.performance.historiqueNotes.reduce((sum, n) => sum + n.note, 0) /
      collaborateur.performance.historiqueNotes.length;
    collaborateur.performance.noteMoyenne = avgNote;

    await collaborateur.save();
    res.json(collaborateur);
  } catch (error) {
    res.status(500).json({ message: 'Error updating performance', error: error.message });
  }
};