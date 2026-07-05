/**
 * Script de mise à jour ponctuelle pour la base existante.
 * - Met ownerId = null pour le compte admin avocat@avocat-pro.tn
 * - Met ownerId = admin._id pour tous les users de rôle 'avocat'
 * - Pour les autres users, ne touche pas : leur ownerId sera défini
 *   automatiquement à la création des nouveaux comptes par le contrôleur.
 *
 * Usage :  node backend/scripts/fix-owners.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

(async () => {
  try {
    await connectDB();

    const admin = await User.findOne({ email: 'avocat@avocat-pro.tn' });
    if (!admin) {
      console.error('[fix-owners] Admin avocat@avocat-pro.tn introuvable. Abandon.');
      process.exit(1);
    }

    // Admin : ownerId = null
    admin.ownerId = null;
    await admin.save();
    console.log(`[fix-owners] Admin ${admin.email} -> ownerId = null`);

    // Avocats existants (sans ownerId) : on les rattache à cet admin
    const avocatsSansOwner = await User.find({ role: 'avocat', ownerId: null, _id: { $ne: admin._id } });
    for (const av of avocatsSansOwner) {
      av.ownerId = admin._id;
      await av.save();
      console.log(`[fix-owners] Avocat ${av.email} -> ownerId = ${admin._id}`);
    }

    console.log(`[fix-owners] Terminé. ${avocatsSansOwner.length} avocat(s) rattaché(s).`);
    process.exit(0);
  } catch (err) {
    console.error('[fix-owners] Erreur :', err);
    process.exit(1);
  }
})();
