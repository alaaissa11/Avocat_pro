require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Collaborateur = require('./src/models/Collaborateur');

const defaultPermissions = {
  admin: ['read', 'write', 'delete', 'manage_users', 'manage_dossiers', 'manage_clients', 'view_stats'],
  avocat: ['read', 'write', 'delete', 'manage_dossiers', 'manage_clients', 'view_stats'],
  collaborateur: ['read', 'write', 'manage_dossiers', 'manage_clients'],
  assistant: ['read', 'write', 'manage_dossiers', 'manage_clients'],
  secretaire: ['read', 'manage_clients']
};

async function upsertUser({ email, password, nom, prenom, role, telephone, specialite = [], tauxHoraire = 0 }) {
  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    console.log(`  ↻ Utilisateur ${email} existe déjà — mot de passe réinitialisé.`);
    user.password = password;
    user.nom = nom;
    user.prenom = prenom;
    user.role = role;
    user.telephone = telephone;
    user.permissions = defaultPermissions[role];
    user.isActive = true;
    await user.save();
  } else {
    user = new User({
      email,
      password,
      nom,
      prenom,
      role,
      telephone,
      permissions: defaultPermissions[role],
      isActive: true
    });
    await user.save();
    console.log(`  ✓ Utilisateur ${email} créé.`);
  }

  if (['avocat', 'collaborateur', 'assistant'].includes(role)) {
    let collab = await Collaborateur.findOne({ userId: user._id });
    if (!collab) {
      collab = new Collaborateur({ userId: user._id, specialite, tauxHoraire });
      await collab.save();
      console.log(`     + fiche Collaborateur créée.`);
    } else {
      console.log(`     ↻ fiche Collaborateur existe déjà.`);
    }
  }
  return user;
}

(async () => {
  try {
    await connectDB();

    console.log('\n=== Création / réinitialisation des comptes de démo ===\n');

    const admin = await upsertUser({
      email: 'admin@cabinet.tn',
      password: 'Admin@2026',
      nom: 'Admin',
      prenom: 'Super',
      role: 'admin',
      telephone: '+216 71 000 000'
    });

    const avocat = await upsertUser({
      email: 'avocat@cabinet.tn',
      password: 'Avocat@2026',
      nom: 'Ben Ali',
      prenom: 'Sarra',
      role: 'avocat',
      telephone: '+216 22 111 222',
      specialite: ['Droit civil', 'Droit de la famille'],
      tauxHoraire: 180
    });

    const collaborateur = await upsertUser({
      email: 'collaborateur@cabinet.tn',
      password: 'Collab@2026',
      nom: 'Trabelsi',
      prenom: 'Mehdi',
      role: 'collaborateur',
      telephone: '+216 22 333 444',
      specialite: ['Droit commercial'],
      tauxHoraire: 90
    });

    const assistant = await upsertUser({
      email: 'assistant@cabinet.tn',
      password: 'Assistant@2026',
      nom: 'Khalil',
      prenom: 'Nour',
      role: 'assistant',
      telephone: '+216 22 555 666',
      specialite: ['Secrétariat juridique'],
      tauxHoraire: 50
    });

    const secretaire = await upsertUser({
      email: 'secretaire@cabinet.tn',
      password: 'Secretaire@2026',
      nom: 'Mabrouk',
      prenom: 'Fatma',
      role: 'secretaire',
      telephone: '+216 22 777 888'
    });

    console.log('\n=== Comptes prêts ===\n');
    console.log('┌────────────────────────────────────────────────────────────────────┐');
    console.log('│ Rôle            │ Email                     │ Mot de passe        │');
    console.log('├────────────────────────────────────────────────────────────────────┤');
    console.log('│ Admin           │ admin@cabinet.tn          │ Admin@2026          │');
    console.log('│ Avocat          │ avocat@cabinet.tn         │ Avocat@2026         │');
    console.log('│ Collaborateur   │ collaborateur@cabinet.tn │ Collab@2026         │');
    console.log('│ Assistant       │ assistant@cabinet.tn     │ Assistant@2026      │');
    console.log('│ Secrétaire      │ secretaire@cabinet.tn    │ Secretaire@2026     │');
    console.log('└────────────────────────────────────────────────────────────────────┘');
    console.log('\nSwagger : http://localhost:3000/api-docs');
    console.log('Login   : POST /api/auth/login avec { email, password }\n');

    process.exit(0);
  } catch (err) {
    console.error('Erreur :', err.message);
    process.exit(1);
  }
})();
