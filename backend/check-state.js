require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./src/models/Client');
const Dossier = require('./src/models/Dossier');
const Collaborateur = require('./src/models/Collaborateur');
const Tache = require('./src/models/Tache');
const Facture = require('./src/models/Facture');
const Document = require('./src/models/Document');
const Calendrier = require('./src/models/Calendrier');
const Operation = require('./src/models/Operation');
const Parametrage = require('./src/models/Parametrage');
const UserModel = require('./src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const counts = {
      users: await UserModel.countDocuments(),
      clients: await Client.countDocuments(),
      dossiers: await Dossier.countDocuments(),
      collaborateurs: await Collaborateur.countDocuments(),
      taches: await Tache.countDocuments(),
      factures: await Facture.countDocuments(),
      documents: await Document.countDocuments(),
      calendrier: await Calendrier.countDocuments(),
      operations: await Operation.countDocuments(),
      parametrage: await Parametrage.countDocuments(),
    };
    console.log(JSON.stringify(counts, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('ERR:', e.message);
    process.exit(1);
  }
})();
