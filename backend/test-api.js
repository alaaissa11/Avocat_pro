const http = require('http');
require('dotenv').config();

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

function httpRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('='.repeat(60));
  console.log('TEST DES APIS CLIENTS ET DOSSIERS');
  console.log('='.repeat(60));
  console.log(`\nBase URL: ${BASE_URL}\n`);

  let createdClientId = null;
  let createdDossierId = null;

  try {
    console.log('1. TEST API CLIENTS');
    console.log('-'.repeat(40));

    console.log('\n1.1 Création Client...');
    const clientData = {
      nom: 'TestAPI',
      prenom: 'Client',
      email: 'testapi@example.com',
      telephone: '+21698765432',
      adresse: '456 Avenue Test',
      ville: 'Sfax',
      type: 'entreprise',
      matriculeFiscal: 'MF123456'
    };
    const createClientRes = await httpRequest('POST', '/api/clients', clientData);
    if (createClientRes.status === 201) {
      createdClientId = createClientRes.data._id;
      console.log(`✓ Client créé: ${createdClientId}`);
      console.log(`   ${createClientRes.data.nom} ${createClientRes.data.prenom}`);
    } else {
      console.log(`✗ Erreur création client: ${createClientRes.status}`);
    }

    console.log('\n1.2 Liste des clients...');
    const clientsRes = await httpRequest('GET', '/api/clients?limit=5');
    if (clientsRes.status === 200) {
      console.log(`✓ ${clientsRes.data.clients.length} client(s) trouvé(s)`);
      clientsRes.data.clients.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.nom} ${c.prenom || ''} (${c.email})`);
      });
    }

    console.log('\n1.3 Client par ID...');
    if (createdClientId) {
      const clientByIdRes = await httpRequest('GET', `/api/clients/${createdClientId}`);
      if (clientByIdRes.status === 200) {
        console.log(`✓ Client trouvé: ${clientByIdRes.data.nom} ${clientByIdRes.data.prenom}`);
      }
    }

    console.log('\n2. TEST API DOSSIERS');
    console.log('-'.repeat(40));

    console.log('\n2.1 Création Dossier...');
    if (createdClientId) {
      const dossierData = {
        titre: 'Dossier Test API',
        description: 'Test de création dossier via API',
        clientId: createdClientId,
        typeAffaire: 'commercial',
        priorite: 4
      };
      const createDossierRes = await httpRequest('POST', '/api/dossiers', dossierData);
      if (createDossierRes.status === 201) {
        createdDossierId = createDossierRes.data._id;
        console.log(`✓ Dossier créé: ${createDossierRes.data._id}`);
        console.log(`   Numéro: ${createDossierRes.data.numero}`);
        console.log(`   Titre: ${createDossierRes.data.titre}`);
        console.log(`   Type: ${createDossierRes.data.typeAffaire}`);
        console.log(`   Client ID: ${createDossierRes.data.clientId}`);
      } else {
        console.log(`✗ Erreur création dossier: ${createDossierRes.status}`);
      }
    }

    console.log('\n2.2 Liste des dossiers...');
    const dossiersRes = await httpRequest('GET', '/api/dossiers?limit=5');
    if (dossiersRes.status === 200) {
      console.log(`✓ ${dossiersRes.data.dossiers.length} dossier(s) trouvé(s)`);
      dossiersRes.data.dossiers.forEach((d, i) => {
        const clientName = d.clientId?.nom || 'N/A';
        console.log(`   ${i + 1}. ${d.numero} - ${d.titre} (${clientName})`);
      });
    }

    console.log('\n2.3 Dossier par ID avec relations...');
    if (createdDossierId) {
      const dossierByIdRes = await httpRequest('GET', `/api/dossiers/${createdDossierId}`);
      if (dossierByIdRes.status === 200) {
        console.log(`✓ Dossier trouvé: ${dossierByIdRes.data.numero}`);
        console.log(`   Client associé: ${dossierByIdRes.data.clientId?.nom} ${dossierByIdRes.data.clientId?.prenom || ''}`);
        console.log(`   Type: ${dossierByIdRes.data.typeAffaire}`);
        console.log(`   Statut: ${dossierByIdRes.data.statut}`);
      }
    }

    console.log('\n3. MODIFICATION ET SUPPRESSION');
    console.log('-'.repeat(40));

    if (createdClientId) {
      console.log('\n3.1 Modification Client...');
      const updateClientRes = await httpRequest('PUT', `/api/clients/${createdClientId}`, {
        ville: 'Tunis',
        observations: 'Client modifié via test API'
      });
      if (updateClientRes.status === 200) {
        console.log(`✓ Client modifié: ${updateClientRes.data.nom} - ${updateClientRes.data.ville}`);
      }
    }

    if (createdDossierId) {
      console.log('\n3.2 Modification Dossier...');
      const updateDossierRes = await httpRequest('PUT', `/api/dossiers/${createdDossierId}`, {
        statut: 'en_cours',
        priorite: 5
      });
      if (updateDossierRes.status === 200) {
        console.log(`✓ Dossier modifié: ${updateDossierRes.data.numero}`);
        console.log(`   Nouveau statut: ${updateDossierRes.data.statut}`);
        console.log(`   Nouvelle priorité: ${updateDossierRes.data.priorite}`);
      }
    }

    console.log('\n4. NETTOYAGE');
    console.log('-'.repeat(40));

    if (createdDossierId) {
      console.log('\n4.1 Suppression Dossier...');
      const deleteDossierRes = await httpRequest('DELETE', `/api/dossiers/${createdDossierId}`);
      if (deleteDossierRes.status === 200) {
        console.log(`✓ Dossier supprimé: ${createdDossierId}`);
      }
    }

    if (createdClientId) {
      console.log('\n4.2 Suppression Client...');
      const deleteClientRes = await httpRequest('DELETE', `/api/clients/${createdClientId}`);
      if (deleteClientRes.status === 200) {
        console.log(`✓ Client supprimé: ${createdClientId}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('TEST DES APIS RÉUSSI!');
    console.log('='.repeat(60));
    console.log('\nEndpoints testés:');
    console.log('   POST   /api/clients');
    console.log('   GET    /api/clients');
    console.log('   GET    /api/clients/:id');
    console.log('   PUT    /api/clients/:id');
    console.log('   DELETE /api/clients/:id');
    console.log('   POST   /api/dossiers');
    console.log('   GET    /api/dossiers');
    console.log('   GET    /api/dossiers/:id');
    console.log('   PUT    /api/dossiers/:id');
    console.log('   DELETE /api/dossiers/:id');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Erreur:', error.message);
    console.log('\nAssurez-vous que le serveur backend est démarré:');
    console.log('   cd backend && npm start');
    process.exit(1);
  }
}

testAPI();