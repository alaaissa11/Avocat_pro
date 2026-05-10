const Parametrage = require('../models/Parametrage');

exports.getParametrages = async (req, res) => {
  try {
    const { categorie } = req.query;
    const query = {};
    if (categorie) query.categorie = categorie;

    const parametrages = await Parametrage.find(query);
    res.json(parametrages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parametrages', error: error.message });
  }
};

exports.getParametrageByKey = async (req, res) => {
  try {
    const parametrage = await Parametrage.findOne({ cle: req.params.cle });
    if (!parametrage) {
      return res.status(404).json({ message: 'Parametrage not found' });
    }
    res.json(parametrage);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parametrage', error: error.message });
  }
};

exports.setParametrage = async (req, res) => {
  try {
    const { cle, valeur, description, categorie, type } = req.body;
    const parametrage = await Parametrage.findOneAndUpdate(
      { cle },
      { cle, valeur, description, categorie, type },
      { upsert: true, new: true }
    );
    res.json(parametrage);
  } catch (error) {
    res.status(500).json({ message: 'Error setting parametrage', error: error.message });
  }
};

exports.deleteParametrage = async (req, res) => {
  try {
    await Parametrage.findOneAndDelete({ cle: req.params.cle, modifiable: true });
    res.json({ message: 'Parametrage deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting parametrage', error: error.message });
  }
};

exports.getNomenclatures = async (req, res) => {
  try {
    const nomenclatures = {
      typesAffaire: [
        { code: 'civil', libelle: 'Affaire Civile' },
        { code: 'penal', libelle: 'Affaire Pénale' },
        { code: 'commercial', libelle: 'Affaire Commerciale' },
        { code: 'travail', libelle: 'Affaire de Travail' },
        { code: 'famille', libelle: 'Affaire de Famille' },
        { code: 'administratif', libelle: 'Affaire Administrative' },
        { code: 'immobilier', libelle: 'Affaire Immobilière' },
        { code: 'bancaire', libelle: 'Affaire Bancaire' }
      ],
      statutsDossier: [
        { code: 'nouveau', libelle: 'Nouveau' },
        { code: 'en_cours', libelle: 'En Cours' },
        { code: 'en_attente', libelle: 'En Attente' },
        { code: 'cloture', libelle: 'Clôturé' },
        { code: 'archive', libellé: 'Archivé' }
      ],
      priorites: [
        { code: 1, libelle: 'Très Faible' },
        { code: 2, libelle: 'Faible' },
        { code: 3, libelle: 'Normale' },
        { code: 4, libelle: 'Haute' },
        { code: 5, libelle: 'Très Haute' }
      ],
      roles: [
        { code: 'admin', libelle: 'Administrateur' },
        { code: 'avocat', libelle: 'Avocat' },
        { code: 'assistant', libelle: 'Assistant' },
        { code: 'secretaire', libelle: 'Secrétaire' }
      ],
      typesDocument: [
        { code: 'contrat', libelle: 'Contrat' },
        { code: 'decision', libelle: 'Décision' },
        { code: 'requete', libelle: 'Requête' },
        { code: 'piece_jointe', libelle: 'Pièce Jointe' },
        { code: 'correspondence', libelle: 'Correspondance' },
        { code: 'facture', libelle: 'Facture' }
      ]
    };
    res.json(nomenclatures);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching nomenclatures', error: error.message });
  }
};