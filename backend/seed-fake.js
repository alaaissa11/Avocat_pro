require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const connectDB = require('./src/config/db');

const Client = require('./src/models/Client');
const Dossier = require('./src/models/Dossier');
const User = require('./src/models/User');
const Tache = require('./src/models/Tache');
const Facture = require('./src/models/Facture');
const Document = require('./src/models/Document');
const Calendrier = require('./src/models/Calendrier');
const Collaborateur = require('./src/models/Collaborateur');
const Parametrage = require('./src/models/Parametrage');
const Operation = require('./src/models/Operation');

// ────────────────────────────────────────────────────────────────────
// Listes de référence (style arabe translittéré, contexte tunisien)
// ────────────────────────────────────────────────────────────────────
const VILLES = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Monastir', 'Bizerte', 'Gabès',
  'Ariana', 'Gafsa', 'La Marsa', 'Hammamet', 'Nabeul', 'Kélibia', 'Mahdia',
  'Kasserine', 'Tataouine', 'Béja', 'Jendouba', 'Le Kef', 'Siliana'
];

const RUES = [
  'Rue de la Liberté', 'Avenue Habib Bourguiba', 'Rue Mohamed V',
  'Avenue Hedi Chaker', 'Rue Emile Zola', 'Place de la République',
  'Rue du 9 Avril', 'Avenue Farhat Hached', 'Rue Taieb Slimane',
  'Boulevard de l\'Environnement', 'Rue Ibn Khaldoun', 'Avenue de la République'
];

const NOMS = [
  'Ben Ali', 'Trabelsi', 'Khalil', 'Mabrouk', 'Chaouch', 'Ben Ammar',
  'Bouguerra', 'Ben Slimane', 'Karray', 'Boukadida', 'Ben Hassen',
  'Dakhlaoui', 'Zoghbi', 'Cherif', 'Saïd', 'Bouzaiene', 'Ghouma',
  'Riahi', 'Ben Khelil', 'Charfeddine', 'Hamdi', 'Jouini', 'Bouazizi',
  'Mejri', 'Lahmar', 'Gharbi', 'Bouchaala', 'Oueslati', 'Dridi'
];

const PRENOMS = [
  'Mohamed', 'Sarra', 'Mehdi', 'Nour', 'Ahmed', 'Fatma', 'Ali',
  'Amira', 'Youssef', 'Ines', 'Hichem', 'Rania', 'Omar', 'Mona',
  'Karim', 'Leila', 'Anis', 'Samira', 'Tarek', 'Nadia', 'Wassim',
  'Salma', 'Riadh', 'Imen', 'Bassem', 'Asma', 'Hedi', 'Khaled'
];

const RAISONS = [
  'Solutions Tech', 'Groupe Atlantique', 'Société Nord-Sud',
  'Tunisie Construction', 'Afriqua Services', 'Méditerranée Invest',
  'Union Commerciale', 'Expertise Finance', 'Innovation Plus',
  'Delta Corporation', 'Oméga Entreprises', 'Alpha Group', 'BTP Maghreb',
  'Carthage Industries', 'Sahara Trading', 'Phénix Télécom'
];

const PROFESSIONS = [
  'directeur', 'ingénieur', 'enseignant', 'comptable', 'médecin',
  'avocat', 'architecte', 'commerçant', 'technicien', 'fonctionnaire',
  'consultant', 'chef de projet', 'artisan'
];

// 30 dossiers répartis sur 8 types d'affaires, avec labels complets
const DOSSIERS_PAR_TYPE = {
  civil: [
    { titre: 'Contentieux de divorce et garde d\'enfants', description: 'Demande en divorce pour faute avec procédure de garde partagée des deux enfants mineurs. Le demandeur allègue abandon du domicile conjugal et comportements incompatibles avec la vie maritale. La partie défenderesse conteste et demande une pension alimentaire substantielle. Litige portant sur la liquidation du régime matrimonial et le partage des biens communs.' },
    { titre: 'Action en responsabilité civile pour dommages corporels', description: 'Accident de la route ayant causé des blessures graves au demandeur : fracture du bassin, traumatisme crânien léger et arrête de travail de 90 jours. Indemnisation demandée pour frais médicaux (4500 DT), perte de revenus (12000 DT) et souffrance morale. La responsabilité du défendeur est engagée pour excès de vitesse et non-respect de la priorité.' },
    { titre: 'Litige de bail commercial et résiliation', description: 'Contestation de la résiliation d\'un bail commercial par le propriétaire pour défaut de paiement de trois termes consécutifs (8500 DT). Le locataire demande des dommages pour trouble de jouissance et violation des engagements de rénovation pris dans le bail. Question sur la validité de la clause résolutoire et son application.' },
    { titre: 'Indemnisation pour défaut de conformité', description: 'Achat d\'un véhicule d\'occasion présentant des vices cachés (moteur défaillant, carrosserie oxydée). Le vendeur professionnel n\'a pas respecté son obligation de garantie. Demande de résolution de la vente et restitution du prix (38000 DT) plus dommages et intérêts.' }
  ],
  penal: [
    { titre: 'Affaire d\'escroquerie et abus de confiance', description: 'Plainte pour escroquerie au préjudice d\'une entreprise de BTP. Le prévenu a détourné des fonds destinés à des investissements immobiliers pour un montant de 150000 DT. Détournement prouvé par expertise comptable. Demande de constitution de partie civile et réparations intégrales.' },
    { titre: 'Poursuite pour vol avec effraction', description: 'Affaire de vol avec effraction dans un magasin de vêtements à Sousse. Le prévenu a été surpris en flagrant délit par les caméras de surveillance. Récidive suspectée (condamnation précédente en 2022). Le ministère public demande 3 ans de prison ferme.' },
    { titre: 'Affaire de trafic de stupéfiants', description: 'Interpellation pour possession de cannabis à visée de trafic. Saisie de 500 grammes de résine de cannabis et d\'une somme de 8000 DT en espèces. Le défendeur conteste la qualité de dealer et revendique un usage personnel. Expertise chimique et audition de témoins demandées.' },
    { titre: 'Diffamation et injure publique', description: 'Publication de propos diffamatoires sur les réseaux sociaux visant un homme d\'affaires local. Plainte pour diffamation et injure publique. Constitution de partie civile et demande de dommages et intérêts de 25000 DT pour atteinte à la réputation.' }
  ],
  commercial: [
    { titre: 'Litige entre actionnaires et administration de société', description: 'Conflit entre associés majoritaires (60%) et minoritaires (40%) sur la gestion d\'une SARL de construction. Allégations de gestion de fait, distributions occultes de dividendes et violation des statuts. Demande de nomination d\'un administrateur judiciaire provisoire et audit comptable externe.' },
    { titre: 'Recouvrement de créance commerciale', description: 'Factures impayées pour un montant de 80000 DT relatives à des prestations de services informatiques fournies sur 18 mois. Mise en demeure restée sans effet. Procédure de commandement de payer et assignation en paiement devant le tribunal de commerce de Tunis. Intérêts moratoires réclamés au taux légal.' },
    { titre: 'Résiliation de contrat commercial pour inexécution', description: 'Résiliation unilatérale d\'un contrat de distribution exclusive par le fournisseur après 5 ans de collaboration. Contestation des motifs de résiliation invoqués (baisse des ventes) et demande de dommages pour rupture abusive. Question sur la clause de préavis contractuel de 6 mois et les pénalités de 50000 DT.' }
  ],
  travail: [
    { titre: 'Licenciement pour faute grave', description: 'Contestation d\'un licenciement pour faute grave d\'un salarié ayant travaillé 10 ans dans une entreprise industrielle. L\'employeur allègue des absences répétées non justifiées et des vols présumés sur le lieu de travail. Le salarié conteste formellement et demande des dommages pour licenciement abusif (48000 DT) ainsi que la réintégration.' },
    { titre: 'Harcèlement moral sur le lieu de travail', description: 'Plainte pour harcèlement moral par une employée contre son supérieur hiérarchique direct. Climat hostile instauré, brimades répétées, rétrogradation unilatérale et mise au placard depuis 8 mois. Demande de dommages et intérêts (30000 DT) et reformation des conditions de travail. Certificat médical du médecin du travail versé au dossier.' },
    { titre: 'Contestation de licenciement économique', description: 'Licenciement économique contesté pour insuffisance de motivation économique réelle et sérieuse. L\'entreprise cite des pertes d\'exploitation mais le salarié conteste le plan social et l\'absence de PSE validé. Procédure de contestation de la validité du licenciement devant le Conseil de Prud\'hommes.' }
  ],
  famille: [
    { titre: 'Procédure de divorce par consentement mutuel', description: 'Demande en divorce par consentement mutuel avec accord sur la garde partagée des deux enfants (8 et 12 ans) et le partage des biens immobiliers. Convention homologuée par le juge aux affaires familiales. Pension alimentaire de 600 DT fixée par enfant et par mois. Partage équitable du patrimoine commun estimé à 250000 DT.' },
    { titre: 'Contestation de filiation et demande de pension', description: 'Action en reconnaissance de paternité intentée par une mère au nom de son enfant mineur. Le père refuse de reconnaître l\'enfant. Test ADN positif réalisé. Demande de pension alimentaire rétroactive depuis la naissance de l\'enfant (5 ans) plus contribution à l\'éducation.' },
    { titre: 'Succession et partage de patrimoine', description: 'Ouverture de succession suite au décès d\'un père de famille. Trois héritiers (deux fils et une fille) en conflit sur le partage des biens immobiliers (3 appartements à Tunis) et des comptes bancaires. Estimation des biens par un expert judiciaire et procédure de partage judiciaire. Patrimoine estimé à 800000 DT.' }
  ],
  immobilier: [
    { titre: 'Litige de bail résidentiel et expulsion', description: 'Procédure d\'expulsion pour défaut de paiement de loyer depuis huit mois (cumul 6400 DT). Le locataire conteste le montant des arriérés et demande des délais de paiement. Proposition de règlement échelonné sur 12 mois rejetée par le propriétaire. Commandement de payer visé par le tribunal.' },
    { titre: 'Trouble de jouissance et voisinage', description: 'Plainte pour troubles anormaux de voisinage suite à des travaux non autorisés ayant modifié la façade de l\'immeuble sans autorisation de la copropriété. Nuisances sonores répétées et empiétement sur les parties communes. Demande de remise en état sous astreinte de 200 DT/jour et dommages pour préjudice de jouissance (8000 DT).' },
    { titre: 'Contestation de vente immobilière pour vice caché', description: 'Contestation d\'une vente aux enchères portant sur un appartement à La Marsa pour vice caché. L\'acquéreur découvre des fissures structurelles importantes et des infiltrations non mentionnées dans l\'acte. Expertise contradictoire demandée. Annulation de la vente et restitution du prix (320000 DT) sollicitées.' }
  ],
  bancaire: [
    { titre: 'Contestation de frais bancaires abusifs', description: 'Contestation des frais de gestion et commissions appliquées sur un compte professionnel d\'une SARL. Découverte de prélèvements non autorisés pour 12500 DT sur 24 mois. Demande de restitution intégrale des sommes indûment perçues et dommages pour pratique abusive. Comparaison avec la moyenne sectorielle versée au dossier.' },
    { titre: 'Litige sur crédit immobilier', description: 'Contestation du taux d\'intérêt appliqué (TEG 9,8%) sur un crédit immobilier contracté en 2022. Allégation de taux usuraire au regard du taux effectif moyen et de clauses abusives dans le contrat. Demande de révision du contrat, restitution des intérêts indus (18000 DT) et substitution de taux.' },
    { titre: 'Blocage de compte et protection du consommateur', description: 'Blocage soudain d\'un compte bancaire professionnel sans notification préalable ni motivation. Le client demande le déblocage immédiat (montant bloqué : 95000 DT) et des dommages pour le préjudice commercial subi. Question sur le respect des obligations de la banque en matière de lutte anti-blanchiment.' }
  ],
  administratif: [
    { titre: 'Recours pour excès de pouvoir - permis de construire', description: 'Recours devant le Tribunal Administratif contre le refus de permis de construire opposé par la municipalité. Le projet porte sur la construction d\'une résidence de 8 appartements à Hammamet. Contestation des motifs esthétiques invoqués. Demande d\'annulation de la décision et réintégration du dossier.' },
    { titre: 'Contentieux fiscal - contestation de redressement', description: 'Contestation d\'un avis de redressement fiscal portant sur 75000 DT de TVA non déclarée. L\'administration fiscale invoque des factures non concordantes. Le contribuable produit l\'intégralité de sa comptabilité et conteste l\'évaluation. Demande de décharge et saisine de la Commission de recours.' }
  ]
};

const ADVERSAIRES = [
  { nom: 'Pierre Durand', avocat: 'Maître Sophie Laurent' },
  { nom: 'Jean Martin', avocat: 'Maître Jean Dupont' },
  { nom: 'Michel Bernard', avocat: 'Maître Marie Lambert' },
  { nom: 'Alain Dubois', avocat: 'Maître Paul Martin' },
  { nom: 'Patrick Petit', avocat: 'Maître Claire Fontaine' },
  { nom: 'Jacques Robert', avocat: 'Maître Philippe Leroy' },
  { nom: 'Société Concorde SA', avocat: 'Maître Vincent Moreau' },
  { nom: 'Établissements du Sud SARL', avocat: 'Maître Isabelle Garnier' },
  { nom: 'Héritiers Ben Youssef', avocat: 'Maître Karim Jebali' }
];

const JURIDICTIONS = [
  'Tribunal de Première Instance de Tunis',
  'Tribunal de Première Instance de Sousse',
  'Tribunal de Première Instance de Sfax',
  'Tribunal de Grande Instance de Tunis',
  'Cour d\'Appel de Tunis',
  'Tribunal de Commerce de Tunis',
  'Conseil de Prud\'hommes de Tunis',
  'Tribunal Administratif de Tunis',
  'Cour de Cassation'
];

const TYPES_AFFAIRE = ['civil', 'penal', 'commercial', 'travail', 'famille', 'immobilier', 'bancaire', 'administratif'];
const STATUTS = ['nouveau', 'en_cours', 'en_attente', 'cloture', 'archive'];

const genererTelephone = () => {
  const prefix = faker.helpers.arrayElement(['+216 2', '+216 5', '+216 9']);
  return `${prefix}${faker.string.numeric(8)}`;
};

const genererDateFuture = (joursMin, joursMax) =>
  faker.date.between({
    from: new Date(Date.now() + joursMin * 86400000),
    to: new Date(Date.now() + joursMax * 86400000)
  });

const genererDatePassee = (joursMin, joursMax) =>
  faker.date.between({
    from: new Date(Date.now() - joursMax * 86400000),
    to: new Date(Date.now() - joursMin * 86400000)
  });

// ────────────────────────────────────────────────────────────────────
// Programme principal
// ────────────────────────────────────────────────────────────────────
(async () => {
  try {
    await connectDB();
    console.log('\n=== SEED FAKES (mixte arabe translittéré) ===\n');

    // Récupération des utilisateurs existants
    const users = await User.find();
    const avocat = users.find(u => u.role === 'avocat');
    const collaborateur = users.find(u => u.role === 'collaborateur');
    const assistant = users.find(u => u.role === 'assistant');
    const admin = users.find(u => u.role === 'admin');
    if (!avocat || !collaborateur) throw new Error('Utilisateurs démo manquants. Lancez create-admin.js d\'abord.');

    // Nettoyage des collections cibles (on garde les users)
    await Promise.all([
      Client.deleteMany({}),
      Dossier.deleteMany({}),
      Tache.deleteMany({}),
      Facture.deleteMany({}),
      Document.deleteMany({}),
      Calendrier.deleteMany({}),
      Parametrage.deleteMany({})
    ]);
    console.log('✓ Collections vidées (users préservés)\n');

    // ─── 1. CLIENTS (20) ──────────────────────────────────────────
    const clientsData = [];
    for (let i = 0; i < 14; i++) {
      const nom = faker.helpers.arrayElement(NOMS);
      const prenom = faker.helpers.arrayElement(PRENOMS);
      clientsData.push({
        nom, prenom,
        email: faker.internet.email({ firstName: prenom, lastName: nom }).toLowerCase(),
        telephone: genererTelephone(),
        adresse: `${faker.number.int({ min: 1, max: 150 })} ${faker.helpers.arrayElement(RUES)}`,
        ville: faker.helpers.arrayElement(VILLES),
        codePostal: faker.string.numeric(4),
        pays: 'Tunisie',
        cin: faker.string.numeric(8),
        type: 'particulier',
        profession: faker.helpers.arrayElement(PROFESSIONS)
      });
    }
    for (let i = 0; i < 6; i++) {
      const raison = faker.helpers.arrayElement(RAISONS);
      clientsData.push({
        nom: raison,
        raisonSociale: raison,
        email: `contact@${raison.toLowerCase().replace(/[^a-z]/g, '')}.tn`,
        telephone: genererTelephone(),
        adresse: `${faker.number.int({ min: 1, max: 150 })} ${faker.helpers.arrayElement(RUES)}`,
        ville: faker.helpers.arrayElement(VILLES),
        codePostal: faker.string.numeric(4),
        pays: 'Tunisie',
        matriculeFiscal: `MT${faker.string.alphanumeric(5).toUpperCase()}`,
        type: 'entreprise'
      });
    }
    const clients = await Client.insertMany(clientsData);
    console.log(`✓ ${clients.length} clients créés (14 particuliers + 6 entreprises)`);

    // ─── 2. DOSSIERS (30) — répartition sur 8 types ───────────────
    const dossiersSpec = [];
    for (const type of TYPES_AFFAIRE) {
      const list = DOSSIERS_PAR_TYPE[type] || [];
      list.forEach(d => dossiersSpec.push({ ...d, typeAffaire: type }));
    }
    // Compléter si < 30
    while (dossiersSpec.length < 30) {
      const type = faker.helpers.arrayElement(TYPES_AFFAIRE);
      const list = DOSSIERS_PAR_TYPE[type];
      const ref = faker.helpers.arrayElement(list);
      dossiersSpec.push({ ...ref, typeAffaire: type });
    }
    const dossiersCrees = [];
    let numDossier = 1;
    for (const d of dossiersSpec.slice(0, 30)) {
      const client = faker.helpers.arrayElement(clients);
      const statut = faker.helpers.arrayElement(STATUTS);
      const dateCreation = genererDatePassee(30, 730);
      const isClosed = statut === 'cloture' || statut === 'archive';
      const adversaire = faker.helpers.arrayElement(ADVERSAIRES);
      const num = `DOS-${new Date().getFullYear()}-${String(numDossier++).padStart(5, '0')}`;

      dossiersCrees.push({
        numero: num,
        titre: d.titre,
        description: d.description,
        clientId: client._id,
        typeAffaire: d.typeAffaire,
        sousType: d.typeAffaire.toUpperCase(),
        statut,
        priorite: faker.number.int({ min: 1, max: 5 }),
        assigneA: faker.helpers.arrayElement([avocat._id, collaborateur._id, assistant._id]),
        collaboreurs: faker.helpers.arrayElements([avocat._id, collaborateur._id, assistant._id], { min: 0, max: 2 }),
        chargeEstimee: faker.number.int({ min: 8, max: 200 }),
        chargeConsommee: isClosed ? faker.number.int({ min: 20, max: 200 }) : faker.number.int({ min: 0, max: 80 }),
        dateCreation,
        dateAudience: genererDateFuture(7, 365),
        dateCloture: isClosed ? genererDatePassee(1, Math.max(2, Math.floor((Date.now() - dateCreation) / 86400000) - 1)) : null,
        numeroRG: `RG-${faker.string.numeric(6)}`,
        numeroDecision: isClosed ? `DEC-${faker.string.numeric(4)}` : null,
        juridiction: faker.helpers.arrayElement(JURIDICTIONS),
        adversary: {
          nom: adversaire.nom,
          avocat: adversaire.avocat,
          email: faker.internet.email().toLowerCase()
        },
        iaPrediction: {
          categorieSuggeree: d.typeAffaire,
          confiance: faker.number.float({ min: 0.65, max: 0.97, fractionDigits: 2 }),
          datePrediction: new Date(),
          dureeSuggeree: faker.number.int({ min: 30, max: 365 }),
          dureeConfiance: faker.number.float({ min: 0.6, max: 0.95, fractionDigits: 2 }),
          probabiliteSuccess: faker.number.float({ min: 0.5, max: 0.95, fractionDigits: 2 })
        },
        historique: [{
          action: 'creation',
          userId: avocat._id,
          date: dateCreation,
          details: `Dossier ${num} créé`
        }],
        createdBy: avocat._id
      });
    }
    const dossiers = await Dossier.insertMany(dossiersCrees);
    console.log(`✓ ${dossiers.length} dossiers juridiques créés`);

    // ─── 3. TÂCHES (30) ──────────────────────────────────────────
    const tachesData = [];
    const TITRES_TACHES = [
      'Préparer le dossier de plaidoirie',
      'Rédiger les conclusions',
      'Étudier la jurisprudence récente',
      'Préparer la convocation des témoins',
      'Réviser le contrat client',
      'Déposer la requête au greffe',
      'Appeler le client pour mise au point',
      'Préparer le dossier de pièces',
      'Analyser les conclusions adverses',
      'Planifier la réunion de stratégie',
      'Vérifier les délais de procédure',
      'Préparer l\'assignation',
      'Rédiger le projet d\'acte',
      'Consulter le client à son domicile',
      'Demander la communication de pièces',
      'Préparer la note de plaidoirie',
      'Effectuer les recherches juridiques',
      'Rédiger le courrier à l\'adversaire',
      'Préparer la consultation',
      'Étudier le dossier en détail'
    ];
    for (let i = 0; i < 30; i++) {
      const dossier = faker.helpers.arrayElement(dossiers);
      const statut = faker.helpers.arrayElement(['a_faire', 'en_cours', 'terminee', 'annulee']);
      const dateEcheance = genererDateFuture(-30, 60);
      tachesData.push({
        titre: faker.helpers.arrayElement(TITRES_TACHES),
        description: `Tâche liée au dossier ${dossier.numero} : ${faker.lorem.sentence({ min: 8, max: 18 })}`,
        dossierId: dossier._id,
        clientId: dossier.clientId,
        assigneeA: faker.helpers.arrayElement([avocat._id, collaborateur._id, assistant._id]),
        creePar: avocat._id,
        priorite: faker.number.int({ min: 1, max: 5 }),
        statut,
        dateEcheance,
        dateDebut: genererDatePassee(1, 30),
        chargeEstimee: faker.number.int({ min: 1, max: 16 }),
        chargeConsommee: statut === 'terminee' ? faker.number.int({ min: 1, max: 16 }) : 0
      });
    }
    await Tache.insertMany(tachesData);
    console.log(`✓ ${tachesData.length} tâches créées`);

    // ─── 4. FACTURES (15) ─────────────────────────────────────────
    const facturesData = [];
    const dossiersFacturables = dossiers.filter(d => d.statut === 'cloture' || d.statut === 'en_cours');
    for (let i = 0; i < 15; i++) {
      const dossier = faker.helpers.arrayElement(dossiersFacturables);
      const article1 = {
        description: 'Honoraires avocat (provision)',
        quantite: faker.number.int({ min: 5, max: 20 }),
        prixUnitaire: faker.helpers.arrayElement([80, 120, 150, 180, 220]),
        tauxTVA: 19
      };
      const article2 = {
        description: 'Frais de dossier et déplacement',
        quantite: 1,
        prixUnitaire: faker.number.int({ min: 150, max: 800 }),
        tauxTVA: 19
      };
      const statut = faker.helpers.arrayElement(['brouillon', 'envoyee', 'payee', 'en_retard']);
      const dateEmission = genererDatePassee(5, 180);
      facturesData.push({
        type: 'facture',
        clientId: dossier.clientId,
        dossierId: dossier._id,
        dateEmission,
        dateEcheance: new Date(dateEmission.getTime() + 30 * 86400000),
        dateReglement: statut === 'payee' ? new Date(dateEmission.getTime() + faker.number.int({ min: 5, max: 30 }) * 86400000) : null,
        statut,
        modeReglement: statut === 'payee' ? faker.helpers.arrayElement(['virement', 'cheque', 'espece']) : undefined,
        articles: [article1, article2],
        notes: faker.helpers.arrayElement([
          'Paiement à réception',
          'Escompte de 2% pour règlement sous 15 jours',
          'Pénalités de retard : 1% par mois',
          'TVA acquittée sur les débits'
        ]),
        conditionReglement: '30 jours fin de mois',
        createdBy: avocat._id
      });
    }
    await Facture.insertMany(facturesData);
    console.log(`✓ ${facturesData.length} factures créées`);

    // ─── 5. DOCUMENTS (20) — métadonnées seulement ───────────────
    const TYPES_DOC = ['contrat', 'plainte', 'pouvoir', 'jugement', 'correspondance', 'decision', 'requete', 'piece_jointe'];
    const docsData = [];
    for (let i = 0; i < 20; i++) {
      const dossier = faker.helpers.arrayElement(dossiers);
      const type = faker.helpers.arrayElement(TYPES_DOC);
      docsData.push({
        nom: `${type.toUpperCase()}_${dossier.numero}_${faker.string.alphanumeric(4).toUpperCase()}.pdf`,
        description: `${type} relatif au dossier ${dossier.numero}`,
        type,
        mimeType: 'application/pdf',
        chemin: `/uploads/${faker.string.numeric(13)}-${faker.helpers.slugify(type)}.pdf`,
        taille: faker.number.int({ min: 50000, max: 5000000 }),
        dossierId: dossier._id,
        clientId: dossier.clientId,
        uploadedBy: avocat._id,
        tags: [dossier.typeAffaire, type, dossier.numero],
        version: 1
      });
    }
    await Document.insertMany(docsData);
    console.log(`✓ ${docsData.length} documents créés (métadonnées)`);

    // ─── 6. ÉVÉNEMENTS CALENDRIER (15) ───────────────────────────
    const eventsData = [];
    const TYPES_EVT = ['audience', 'rendez_vous', 'echeance', 'conge', 'formation'];
    for (let i = 0; i < 15; i++) {
      const type = faker.helpers.arrayElement(TYPES_EVT);
      const dossier = type === 'audience' || type === 'echeance' ? faker.helpers.arrayElement(dossiers) : null;
      const dateDebut = genererDateFuture(-15, 120);
      const dateFin = new Date(dateDebut.getTime() + (type === 'audience' ? 2 : 1) * 3600000);

      const titreMap = {
        audience: `Audience ${dossier.numero}`,
        rendez_vous: 'Rendez-vous client - consultation',
        echeance: `Échéance procédure ${dossier.numero}`,
        conge: 'Congés annuels',
        formation: 'Formation continue - Droit des affaires'
      };
      eventsData.push({
        titre: titreMap[type],
        description: `${type} planifié`,
        type,
        dossierId: dossier?._id,
        clientId: dossier?.clientId,
        userId: avocat._id,
        assignes: faker.helpers.arrayElements([avocat._id, collaborateur._id, assistant._id], { min: 1, max: 2 }),
        dateDebut,
        dateFin,
        estJourEntier: type === 'conge',
        lieu: type === 'audience' ? 'Tribunal de Tunis' : faker.helpers.arrayElement(['Cabinet', 'Tribunal', 'Étude']),
        priorite: faker.number.int({ min: 1, max: 5 }),
        statut: faker.helpers.arrayElement(['planifie', 'confirme', 'termine']),
        estPrive: false,
        createdBy: avocat._id
      });
    }
    await Calendrier.insertMany(eventsData);
    console.log(`✓ ${eventsData.length} événements calendrier créés`);

    // ─── 7. PARAMÉTRAGE (10) ──────────────────────────────────────
    const params = [
      { cle: 'cabinet.nom', valeur: 'Cabinet Boussayene Knani', description: 'Nom du cabinet', categorie: 'general' },
      { cle: 'cabinet.adresse', valeur: 'Avenue Habib Bourguiba, Tunis', description: 'Adresse officielle', categorie: 'general' },
      { cle: 'cabinet.telephone', valeur: '+216 71 123 456', description: 'Téléphone principal', categorie: 'general' },
      { cle: 'facturation.tauxTVA', valeur: 19, description: 'Taux de TVA par défaut (%)', categorie: 'facturation', type: 'number' },
      { cle: 'facturation.devise', valeur: 'DT', description: 'Devise des factures', categorie: 'facturation' },
      { cle: 'facturation.delaiPaiement', valeur: 30, description: 'Délai de paiement par défaut (jours)', categorie: 'facturation', type: 'number' },
      { cle: 'dossier.dureeClotureAuto', valeur: 730, description: 'Clôture auto après N jours (jours)', categorie: 'dossier', type: 'number' },
      { cle: 'notification.emailActif', valeur: true, description: 'Activer les emails', categorie: 'notification', type: 'boolean' },
      { cle: 'notification.rappelAudience', valeur: 48, description: 'Rappel audience avant (heures)', categorie: 'notification', type: 'number' },
      { cle: 'ia.active', valeur: true, description: 'Activer les prédictions IA', categorie: 'ia', type: 'boolean' }
    ];
    await Parametrage.insertMany(params);
    console.log(`✓ ${params.length} paramètres créés`);

    console.log('\n=== SEED TERMINÉ AVEC SUCCÈS ===\n');
    console.log('Récapitulatif :');
    console.log(`  • ${clients.length} clients`);
    console.log(`  • ${dossiers.length} dossiers juridiques`);
    console.log(`  • ${tachesData.length} tâches`);
    console.log(`  • ${facturesData.length} factures`);
    console.log(`  • ${docsData.length} documents`);
    console.log(`  • ${eventsData.length} événements calendrier`);
    console.log(`  • ${params.length} paramètres\n`);

    process.exit(0);
  } catch (err) {
    console.error('Erreur :', err);
    process.exit(1);
  }
})();
