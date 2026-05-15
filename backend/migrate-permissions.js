const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/avocat-pro';

const defaultPermissions = {
  admin: ['read', 'write', 'delete', 'manage_users', 'manage_dossiers', 'manage_clients', 'view_stats'],
  avocat: ['read', 'write', 'delete', 'manage_dossiers', 'manage_clients', 'view_stats'],
  assistant: ['read', 'write', 'manage_dossiers', 'manage_clients'],
  secretaire: ['read', 'manage_clients']
};

async function addPermissionsToUsers() {
  console.log('='.repeat(50));
  console.log('MIGRATION: Ajout des permissions aux utilisateurs');
  console.log('='.repeat(50));

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connexion MongoDB établie');

    const users = await User.find({});
    console.log(`\n${users.length} utilisateur(s) trouvé(s)\n`);

    let updatedCount = 0;

    for (const user of users) {
      const oldPermissions = JSON.stringify(user.permissions || []);
      const rolePermissions = defaultPermissions[user.role] || ['read'];

      if (!user.permissions || user.permissions.length === 0) {
        user.permissions = rolePermissions;
        await user.save();
        console.log(`✓ ${user.nom} ${user.prenom} (${user.role}): permissions ajoutées`);
        updatedCount++;
      } else {
        console.log(`○ ${user.nom} ${user.prenom} (${user.role}): déjà des permissions [${oldPermissions}]`);
      }
    }

    console.log('\n' + '-'.repeat(50));
    console.log(`✓ ${updatedCount} utilisateur(s) mis à jour(s)`);
    console.log('='.repeat(50));

    console.log('\nPermissions par rôle:');
    Object.entries(defaultPermissions).forEach(([role, perms]) => {
      console.log(`  ${role}: [${perms.join(', ')}]`);
    });

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Erreur:', error.message);
    process.exit(1);
  }
}

addPermissionsToUsers();