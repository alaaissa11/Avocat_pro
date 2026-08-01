const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');
const { sendPasswordResetEmail } = require('../services/emailService');

const defaultPermissions = {
  admin: ['read', 'write', 'delete', 'manage_users', 'manage_dossiers', 'manage_clients', 'view_stats'],
  avocat: ['read', 'write', 'delete', 'manage_dossiers', 'manage_clients', 'view_stats'],
  assistant: ['read', 'write', 'manage_dossiers', 'manage_clients'],
  secretaire: ['read', 'manage_clients']
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

exports.register = async (req, res) => {
  try {
    const { email, password, nom, prenom, role, telephone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const userRole = role || 'assistant';
    const user = new User({
      email,
      password,
      nom,
      prenom,
      role: userRole,
      telephone,
      permissions: defaultPermissions[userRole] || ['read']
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, email, nom, prenom, role: userRole, statut: 'actif', permissions: user.permissions },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).populate('ownerId', 'nom prenom email role');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive && (!user.statut || user.statut === 'actif')) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ userId: user._id }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    res.json({
      message: 'Login successful',
      user: { 
        id: user._id, 
        email: user.email, 
        nom: user.nom, 
        prenom: user.prenom, 
        role: user.role, 
        statut: user.statut || 'actif',
        permissions: user.permissions,
        ownerId: user.ownerId
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('ownerId', 'nom prenom email role');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { nom, prenom, telephone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nom, prenom, telephone, avatar },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashToken(token);
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(user.email, token, user.prenom);

    res.status(200).json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token et nouveau mot de passe requis' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const user = await User.findOne({ resetPasswordToken: hashToken(token) });
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Lien de réinitialisation invalide ou expiré' });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la réinitialisation', error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
};