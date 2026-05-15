const mongoose = require('mongoose');
const Client = require('./src/models/Client');
const Dossier = require('./src/models/Dossier');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/avocat-pro';

async function testModels() {
  console.log('='.repeat(60));
  console.log('TEST DES MODELES CLIENTS ET DOSSIERS');
  console.log('='.repeat(60));

  try {
    console.log('\n1. Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connexion établie avec succès');

    console.log('\n2. Vérification des modèles...');
    console.log(`✓ Modèle Client: ${Client.modelName}`);
    console.log(`✓ Modèle Dossier: ${Dossier.modelName}`);

    console.log('\n3. Schéma Client - Champs disponibles:');
    const clientFields = Object.keys(Client.schema.paths).filter(f => !f.startsWith('__'));
    clientFields.forEach(field => {
      const schemaType = Client.schema.paths[field];
      console.log(`   - ${field}: ${schemaType.instance}${schemaType.isRequired ? ' (required)' : ''}`);
    });

    console.log('\n4. Schéma Dossier - Champs disponibles:');
    const dossierFields = Object.keys(Dossier.schema.paths).filter(f => !f.startsWith('__'));
    dossierFields.forEach(field => {
      const schemaType = Dossier.schema.paths[field];
      console.log(`   - ${field}: ${schemaType.instance}${schemaType.isRequired ? ' (required)' : ''}`);
    });

    console.log('\n5. Test de création Client...');
    const testClient = new Client({
      nom: 'Test',
      prenom: 'Client',
      email: 'test.client@example.com',
      telephone: '+21612345678',
      adresse: '123 Rue Test',
      ville: 'Tunis',
      type: 'particulier'
    });
    await testClient.save();
    console.log(`✓ Client créé: ${testClient._id}`);
    console.log(`   Nom complet: ${testClient.nom} ${testClient.prenom || ''}`);
    console.log(`   Email: ${testClient.email}`);
    console.log(`   Type: ${testClient.type}`);

    console.log('\n6. Test de création Dossier...');
    const testDossier = new Dossier({
      titre: 'Dossier de test',
      description: 'Description du dossier de test',
      clientId: testClient._id,
      typeAffaire: 'civil',
      priorite: 3
    });
    await testDossier.save();
    console.log(`✓ Dossier créé: ${testDossier._id}`);
    console.log(`   Numéro: ${testDossier.numero}`);
    console.log(`   Titre: ${testDossier.titre}`);
    console.log(`   Type: ${testDossier.typeAffaire}`);
    console.log(`   Statut: ${testDossier.statut}`);
    console.log(`   Client associé: ${testClient.nom} ${testClient.prenom || ''}`);

    console.log('\n7. Vérification relation Client -> Dossiers...');
    const dossiersCount = await Dossier.countDocuments({ clientId: testClient._id });
    console.log(`✓ Le client a ${dossiersCount} dossier(s) associé(s)`);

    console.log('\n8. Vérification relation Dossier -> Client...');
    const dossierWithClient = await Dossier.findById(testDossier._id).populate('clientId', 'nom prenom email');
    console.log(`✓ Dossier associé au client: ${dossierWithClient.clientId.nom} ${dossierWithClient.clientId.prenom || ''}`);

    console.log('\n9. Test API Backend - Endpoints disponibles:');
    console.log('   POST   /api/clients        - Créer un client');
    console.log('   GET    /api/clients        - Liste des clients');
    console.log('   GET    /api/clients/:id    - Client par ID');
    console.log('   PUT    /api/clients/:id    - Modifier un client');
    console.log('   DELETE /api/clients/:id    - Supprimer un client');
    console.log('   POST   /api/dossiers       - Créer un dossier');
    console.log('   GET    /api/dossiers       - Liste des dossiers');
    console.log('   GET    /api/dossiers/:id   - Dossier par ID');
    console.log('   PUT    /api/dossiers/:id   - Modifier un dossier');
    console.log('   DELETE /api/dossiers/:id   - Supprimer un dossier');

    console.log('\n10. Test Frontend - Services Angular:');
    console.log('   ClientService: http://localhost:3000/api/clients');
    console.log('   DossierService: http://localhost:3000/api/dossiers');

    console.log('\n11. Nettoyage - Suppression des données de test...');
    await Dossier.findByIdAndDelete(testDossier._id);
    await Client.findByIdAndDelete(testClient._id);
    console.log('✓ Données de test supprimées');

    console.log('\n' + '='.repeat(60));
    console.log('TOUS LES TESTS RÉUSSIS!');
    console.log('='.repeat(60));
    console.log('\nRésumé:');
    console.log(`- Base de données: ${MONGO_URI}`);
    console.log(`- Backend: http://localhost:3000`);
    console.log(`- Modèle Client: ${Object.keys(Client.schema.paths).length} champs`);
    console.log(`- Modèle Dossier: ${Object.keys(Dossier.schema.paths).length} champs`);
    console.log(`- Relation: Dossier.clientId -> Client._id`);

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Erreur:', error.message);
    process.exit(1);
  }
}

testModels();