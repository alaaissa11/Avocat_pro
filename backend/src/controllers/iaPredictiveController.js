const { predictNewDossier, storePredictionFeedback } = require('../services/predictiveIAService');
const { extractKeywords } = require('../services/textAnalysisService');

const predictDossier = async (req, res) => {
  try {
    const { description, titre, typeAffaire, priorite } = req.body;

    if (!titre || !description) {
      return res.status(400).json({
        success: false,
        message: 'Le titre et la description sont requis pour l\'analyse'
      });
    }

    const prediction = await predictNewDossier({
      description,
      titre,
      typeAffaire,
      priorite
    });

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Erreur prédiction IA:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse prédictive',
      error: error.message
    });
  }
};

const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Le texte à analyser est requis'
      });
    }

    const keywords = extractKeywords(text);

    res.json({
      success: true,
      data: {
        texte: text,
        motsCles: keywords,
        nombreMotsCles: keywords.length,
        dateAnalyse: new Date()
      }
    });
  } catch (error) {
    console.error('Erreur analyse texte:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse du texte',
      error: error.message
    });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { predictionId, dossierId, suggestionsAcceptees, suggestionsRefusees, commentaire } = req.body;

    if (!predictionId || !dossierId) {
      return res.status(400).json({
        success: false,
        message: 'predictionId et dossierId sont requis'
      });
    }

    const feedback = await storePredictionFeedback(predictionId, dossierId, {
      suggestionsAcceptees,
      suggestionsRefusees,
      commentaire,
      dateSoumission: new Date()
    });

    res.json({
      success: true,
      message: 'Feedback enregistré avec succès',
      data: feedback
    });
  } catch (error) {
    console.error('Erreur feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement du feedback',
      error: error.message
    });
  }
};

const getPlanningTypes = async (req, res) => {
  try {
    const { PLANNING_STEPS } = require('../services/predictiveIAService');
    
    res.json({
      success: true,
      data: Object.keys(PLANNING_STEPS).map(type => ({
        type,
        etapes: PLANNING_STEPS[type].length
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des types de planning',
      error: error.message
    });
  }
};

module.exports = {
  predictDossier,
  analyzeText,
  submitFeedback,
  getPlanningTypes
};