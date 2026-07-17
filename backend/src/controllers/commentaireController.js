const Commentaire = require('../models/Commentaire');

exports.getComments = async (req, res) => {
  try {
    const { entiteType, entiteId } = req.params;
    const commentaires = await Commentaire.find({ entiteType, entiteId })
      .populate('auteur', 'nom prenom email')
      .sort({ createdAt: 1 });
    res.json(commentaires);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { entiteType, entiteId, contenu } = req.body;
    if (!entiteType || !entiteId || !contenu?.trim()) {
      return res.status(400).json({ message: 'Champs obligatoires : entiteType, entiteId, contenu' });
    }
    const commentaire = new Commentaire({
      entiteType, entiteId, auteur: req.user._id, contenu: contenu.trim()
    });
    await commentaire.save();
    const populated = await Commentaire.findById(commentaire._id)
      .populate('auteur', 'nom prenom email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { contenu } = req.body;
    if (!contenu?.trim()) return res.status(400).json({ message: 'Le contenu est requis' });
    const commentaire = await Commentaire.findById(req.params.id);
    if (!commentaire) return res.status(404).json({ message: 'Commentaire non trouvé' });
    if (commentaire.auteur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Seul l\'auteur peut modifier' });
    }
    commentaire.contenu = contenu.trim();
    await commentaire.save();
    const populated = await Commentaire.findById(commentaire._id)
      .populate('auteur', 'nom prenom email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const commentaire = await Commentaire.findById(req.params.id);
    if (!commentaire) return res.status(404).json({ message: 'Commentaire non trouvé' });
    if (commentaire.auteur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Seul l\'auteur peut supprimer' });
    }
    await Commentaire.findByIdAndDelete(req.params.id);
    res.json({ message: 'Commentaire supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};
