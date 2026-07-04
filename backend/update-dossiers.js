require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Dossier = require('./src/models/Dossier');

const dossiersUpdates = [
  {
    numero: 'DOS-2026-00001',
    description: 'Affaire de divorce pour faute avec garde partagée des deux enfants mineurs. Le demandeur allègue des comportements incompatibles avec la vie conjugale, abandon du domicile et infidélité. La partie défenderesse conteste et demande une pension alimentaire. Litige portant sur la liquidation du régime matrimonial. Jugement favorable au demandeur - divorce prononcé pour faute, garde partagée accordée, pension de 800 DT.',
    statut: 'cloture',
    dateCloture: new Date('2025-10-15'),
    iaPrediction: { categorieSuggeree: 'famille', confiance: 85 },
    historique: [{ action: 'cloture', details: 'Décision favorable au client' }]
  },
  {
    numero: 'DOS-2026-00002',
    description: 'Contentieux commercial relatif à un litige entre associés majoritaires et minoritaires sur la gestion d\'une société de construction. Allégations de gestion de fait et de violation des statuts sociaux. Demande de nomination d\'un administrateur judiciaire. Accord à l\'amiable trouvé entre les parties - rachat des parts par le majoritaire.',
    statut: 'cloture',
    dateCloture: new Date('2025-08-20'),
    iaPrediction: { categorieSuggeree: 'commercial', confiance: 78 },
    historique: [{ action: 'cloture', details: 'Transaction homologuée' }]
  },
  {
    numero: 'DOS-2026-00003',
    description: 'Contestation de licenciement pour faute grave d\'un salarié ayant travaillé 8 ans dans l\'entreprise. L\'employeur allègue des absences répétées et des vols présumés. Le salarié conteste et demande la requalification en licenciement sans cause réelle et sérieuse. Procédure aux prud\'hommes. Jugement: licenciement sans cause réelle - indemnités accordées.',
    statut: 'cloture',
    dateCloture: new Date('2025-09-10'),
    iaPrediction: { categorieSuggeree: 'travail', confiance: 82 },
    historique: [{ action: 'cloture', details: 'Décision favorable au salarié' }]
  },
  {
    numero: 'DOS-2026-00004',
    description: 'Action en responsabilité civile pour dommages corporels suite à un accident de la route. Le demandeur a subi une fracture du bassin et un traumatisme crânien. La responsabilité du défendeur engagée pour excès de vitesse. Indemnisation demandée pour frais médicaux, perte de revenus et préjudice moral. Accordtransactionnel - indemnité de 45000 DT.',
    statut: 'cloture',
    dateCloture: new Date('2025-07-25'),
    iaPrediction: { categorieSuggeree: 'civil', confiance: 75 },
    historique: [{ action: 'cloture', details: 'Transaction homologuée' }]
  },
  {
    numero: 'DOS-2026-00005',
    description: 'Plainte pour escroquerie au préjudice d\'une entreprise. Le prévenu a détourné des fonds destinés à des investissements immobiliers pour un montant de 150000 DT. Mise en examen, confrontation. Le ministère public requiert 4 ans de prison ferme. Jugement: condamnation à 3 ans dont 1 avec sursis.',
    statut: 'cloture',
    dateCloture: new Date('2025-06-30'),
    iaPrediction: { categorieSuggeree: 'penal', confiance: 88 },
    historique: [{ action: 'cloture', details: 'Condamnation prononcée' }]
  },
  {
    numero: 'DOS-2026-00006',
    description: 'Litige de bail commercial avec contestation de la résiliation pour défaut de paiement de trois termes. Le locataire conteste et demande des dommages pour trouble de jouissance et violation du bail. Question sur la clause résolutoire. Jugement: résiliation confirmée mais dommages-intérêts pour le locataire.',
    statut: 'cloture',
    dateCloture: new Date('2025-11-05'),
    iaPrediction: { categorieSuggeree: 'immobilier', confiance: 72 },
    historique: [{ action: 'cloture', details: 'Décision partielle' }]
  },
  {
    numero: 'DOS-2026-00007',
    description: 'Contestation de frais bancaires et de commissions appliquées sur un compte professionnel. Découverte de prélèvements non autorisés. Demande de restitution des sommes et dommages pour pratique abusive. Accord amiable - banque accepte le remboursement intégral plus intérêts.',
    statut: 'cloture',
    dateCloture: new Date('2025-08-15'),
    iaPrediction: { categorieSuggeree: 'bancaire', confiance: 80 },
    historique: [{ action: 'cloture', details: 'Accord à l\'amiable' }]
  },
  {
    numero: 'DOS-2026-00008',
    description: 'Procedure de divorce par consentement mutuel avec accord sur la garde des enfants et le partage des biens. Convention homologuée par le juge aux affaires familiales. Pension alimentaire de 600 DT fixée pour les deux enfants. Partage équitable des biens immobiliers.',
    statut: 'cloture',
    dateCloture: new Date('2025-05-20'),
    iaPrediction: { categorieSuggeree: 'famille', confiance: 92 },
    historique: [{ action: 'cloture', details: 'Divorce prononcé - consentement mutuel' }]
  },
  {
    numero: 'DOS-2026-00009',
    description: 'Recouvrement de créance commerciale pour un montant de 80000 DT. Mise en demeure restée sans effet. Procédure de commandement de payer et assignation en paiement devant le tribunal de commerce. Intérêts moratoires réclamés. Jugement: condamnation au paiement intégral avec intérêts.',
    statut: 'cloture',
    dateCloture: new Date('2025-09-28'),
    iaPrediction: { categorieSuggeree: 'commercial', confiance: 85 },
    historique: [{ action: 'cloture', details: 'Condamnation au paiement' }]
  },
  {
    numero: 'DOS-2026-00010',
    description: 'Harcèlement moral sur le lieu de travail. Employée contre son supérieur hiérarchique. Climat hostile, brimades répétées, rétrogradation unilatérale. Demande de dommages-intérêts et reformation des conditions de travail. Jugement: harcèlement reconnu - dommages de 15000 DT accordés.',
    statut: 'cloture',
    dateCloture: new Date('2025-10-08'),
    iaPrediction: { categorieSuggeree: 'travail', confiance: 86 },
    historique: [{ action: 'cloture', details: 'Décision favorable à l\'employée' }]
  },
  {
    numero: 'DOS-2026-00011',
    description: 'Poursuite pour vol avec effraction dans un magasin. Le prévenu a été surpris en flagrant délit par les caméras de surveillance. Récidive suspectée. Le ministère public requiert une peine de prison ferme. Jugement: 2 ans de prison dont 6 mois avec sursis.',
    statut: 'cloture',
    dateCloture: new Date('2025-07-12'),
    iaPrediction: { categorieSuggeree: 'penal', confiance: 84 },
    historique: [{ action: 'cloture', details: 'Condamnation prononcée' }]
  },
  {
    numero: 'DOS-2026-00012',
    description: 'Litige sur crédit immobilier avec contestation du taux d\'intérêt appliqué. Allégation de taux usuraire et de clause abusive dans le contrat. Demande de révision du contrat et restitution des intérêts indus. Arrangement amiable - taux révisé et restitution partielle.',
    statut: 'cloture',
    dateCloture: new Date('2025-11-15'),
    iaPrediction: { categorieSuggeree: 'bancaire', confiance: 77 },
    historique: [{ action: 'cloture', details: 'Accord amiable' }]
  },
  {
    numero: 'DOS-2026-00013',
    description: 'Succession et partage de patrimoine suite au décès d\'un père de famille. Trois héritiers en conflit sur le partage des biens immobiliers et des comptes bancaires. Estimation des biens par un expert. Procédure de partage judiciaire. Jugement: partage équitable selon les quotes-parts légales.',
    statut: 'cloture',
    dateCloture: new Date('2025-06-18'),
    iaPrediction: { categorieSuggeree: 'famille', confiance: 79 },
    historique: [{ action: 'cloture', details: 'Partage prononcé' }]
  },
  {
    numero: 'DOS-2026-00014',
    description: 'Trouble de voisinage et troubles anormaux de jouissance. Travaux non autorisés ayant modifié la façade de l\'immeuble sans autorisation de la copropriété. Demande de remise en état et dommages pour préjudice. Injonction de remise en état dans les 30 jours + dommages de 5000 DT.',
    statut: 'cloture',
    dateCloture: new Date('2025-08-30'),
    iaPrediction: { categorieSuggeree: 'immobilier', confiance: 74 },
    historique: [{ action: 'cloture', details: 'Décision favorable au demandeur' }]
  },
  {
    numero: 'DOS-2026-00015',
    description: 'Contestation de filiation et demande de pension alimentaire rétroactive. Action en reconnaissance de paternité. Le père refuse de reconnaître l\'enfant. Test ADN demandé et réalisé. Jugement: paternité reconnue - pension rétroactive de 3 ans accordée.',
    statut: 'cloture',
    dateCloture: new Date('2025-10-25'),
    iaPrediction: { categorieSuggeree: 'famille', confiance: 81 },
    historique: [{ action: 'cloture', details: 'Paternité reconnue' }]
  }
];

const updateDossiers = async () => {
  try {
    await connectDB();
    
    let updated = 0;
    let notFound = 0;
    
    for (const update of dossiersUpdates) {
      const { numero, ...updateData } = update;
      
      const result = await Dossier.updateOne(
        { numero },
        { $set: updateData }
      );
      
      if (result.matchedCount > 0) {
        updated++;
        console.log(`✓ Dossier ${numero} mis à jour`);
      } else {
        notFound++;
        console.log(`✗ Dossier ${numero} non trouvé`);
      }
    }
    
    console.log(`\n=== Résultat ===`);
    console.log(`Dossiers mis à jour: ${updated}`);
    console.log(`Dossiers non trouvés: ${notFound}`);
    console.log(`Total traités: ${dossiersUpdates.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
};

updateDossiers();