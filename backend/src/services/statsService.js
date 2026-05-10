const Dossier = require('../models/Dossier');
const Facture = require('../models/Facture');
const Tache = require('../models/Tache');
const Collaborateur = require('../models/Collaborateur');
const User = require('../models/User');

const getDashboardStats = async () => {
  const totalDossiers = await Dossier.countDocuments();
  const dossiersParStatut = await Dossier.aggregate([
    { $group: { _id: '$statut', count: { $sum: 1 } } }
  ]);

  const totalClients = await require('../models/Client').countDocuments();
  const totalFactures = await Facture.countDocuments();
  const chiffreAffaire = await Facture.aggregate([
    { $group: { _id: null, total: { $sum: '$totalTTC' } } }
  ]);

  const tacheParStatut = await Tache.aggregate([
    { $group: { _id: '$statut', count: { $sum: 1 } } }
  ]);

  const audienciaProchaines = await Calendrier.aggregate([
    { $match: { type: 'audience', dateDebut: { $gte: new Date() } } },
    { $sort: { dateDebut: 1 } },
    { $limit: 5 }
  ]);

  return {
    totalDossiers,
    dossiersParStatut,
    totalClients,
    totalFactures,
    chiffreAffaire: chiffreAffaire[0]?.total || 0,
    tacheParStatut,
    audienciaProchaines
  };
};

const getPerformanceParCollaborateur = async (userId) => {
  const collaborateur = await Collaborateur.findOne({ userId });
  if (!collaborateur) return null;

  const dossiersTraites = await Dossier.countDocuments({ assigneA: userId });
  const dossiersClotures = await Dossier.countDocuments({ assigneA: userId, statut: 'cloture' });

  const heuresParMois = await Tache.aggregate([
    { $match: { assigneeA: userId, statut: 'terminee' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$dateFin' } },
        totalHeures: { $sum: '$chargeConsommee' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    performance: collaborateur.performance,
    dossiersTraites,
    dossiersClotures,
    heuresParMois
  };
};

module.exports = { getDashboardStats, getPerformanceParCollaborateur };