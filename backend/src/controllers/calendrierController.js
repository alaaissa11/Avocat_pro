const Calendrier = require('../models/Calendrier');
const Operation = require('../models/Operation');
const Dossier = require('../models/Dossier');

const buildCalendrierScopeForUser = async (user) => {
  if (user.role === 'admin') return {};

  const dossierScope = {
    $or: [
      { assigneA: user._id },
      { collaboreurs: user._id },
      { createdBy: user._id }
    ]
  };

  const userDossiers = await Dossier.find(dossierScope).select('_id').lean();
  const dossierIds = userDossiers.map(d => d._id);

  return {
    $or: [
      { dossierId: { $in: dossierIds } },
      { createdBy: user._id }
    ]
  };
};

exports.createEvent = async (req, res) => {
  try {
    const event = new Calendrier({ ...req.body, createdBy: req.user._id });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { start, end, userId, type, dossierId } = req.query;
    const query = {};

    if (start && end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      query.dateDebut = { $gte: new Date(start), $lte: endDate };
    }

    if (userId) query.$or = [{ userId }, { assignes: userId }];
    if (type) query.type = type;
    if (dossierId) query.dossierId = dossierId;

    const scope = await buildCalendrierScopeForUser(req.user);
    if (Object.keys(scope).length > 0) {
      if (query.$or) {
        query.$and = [{ $or: query.$or }, scope];
        delete query.$or;
      } else {
        Object.assign(query, scope);
      }
    }

    const events = await Calendrier.find(query)
      .populate('userId', 'nom prenom')
      .populate('assignes', 'nom prenom')
      .populate('dossierId', 'numero titre')
      .sort({ dateDebut: 1 })
      .lean();

    const dossierQuery = { dateAudience: { $ne: null, $exists: true } };
    const dossierScope = await buildDossierScopeForUser(req.user);
    if (Object.keys(dossierScope).length > 0) Object.assign(dossierQuery, dossierScope);
    if (start && end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      dossierQuery.dateAudience = { $gte: new Date(start), $lte: endDate };
    }

    const dossierAudiences = await Dossier.find(dossierQuery)
      .select('numero titre typeAffaire dateAudience lieu statut createdBy')
      .lean();

    const dossiersAsEvents = dossierAudiences.map(d => ({
      _id: `dossier-${d._id}`,
      _source: 'dossier',
      titre: `Audience - ${d.titre || d.numero || 'Sans titre'}`,
      type: 'audience',
      dateDebut: d.dateAudience,
      dateFin: d.dateAudience,
      lieu: d.lieu || '',
      statut: d.statut,
      dossierId: { _id: d._id, numero: d.numero, titre: d.titre },
      createdBy: d.createdBy
    }));

    const merged = [...events, ...dossiersAsEvents].sort((a, b) => {
      const da = new Date(a.dateDebut).getTime();
      const db = new Date(b.dateDebut).getTime();
      return da - db;
    });

    res.json(merged);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Calendrier.findById(req.params.id)
      .populate('userId')
      .populate('assignes')
      .populate('dossierId');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const scope = await buildCalendrierScopeForUser(req.user);
    if (Object.keys(scope).length > 0) {
      const inScope = event.dossierId && scope.$or.some(or => 
        or.dossierId && or.dossierId.$in && or.dossierId.$in.some(id => id.toString() === event.dossierId._id.toString())
      );
      if (!inScope && event.createdBy?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Accès refusé à cet événement.' });
      }
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const existing = await Calendrier.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const scope = await buildCalendrierScopeForUser(req.user);
    if (Object.keys(scope).length > 0) {
      const inScope = existing.dossierId && scope.$or.some(or => 
        or.dossierId && or.dossierId.$in && or.dossierId.$in.some(id => id.toString() === existing.dossierId.toString())
      );
      if (!inScope && existing.createdBy?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Accès refusé à cet événement.' });
      }
    }

    const event = await Calendrier.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await new Operation({
      type: 'calendrier_modifie',
      entiteType: 'calendrier',
      entiteId: event._id,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `Event "${event.titre}" modified`
    }).save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const existing = await Calendrier.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (req.user.role !== 'admin') {
      const scope = await buildCalendrierScopeForUser(req.user);
      if (Object.keys(scope).length > 0) {
        const inScope = existing.dossierId && scope.$or.some(or => 
          or.dossierId && or.dossierId.$in && or.dossierId.$in.some(id => id.toString() === existing.dossierId.toString())
        );
        if (!inScope && existing.createdBy?.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Accès refusé à cet événement.' });
        }
      }
    }

    await Calendrier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

const buildDossierScopeForUser = async (user) => {
  if (user.role === 'admin') return {};
  return {
    $or: [
      { assigneA: user._id },
      { collaboreurs: user._id },
      { createdBy: user._id }
    ]
  };
};

const formatDossierAsAudience = (d) => ({
  _id: `dossier-${d._id}`,
  _source: 'dossier',
  titre: `Audience - ${d.titre || d.numero || 'Sans titre'}`,
  type: 'audience',
  dateDebut: d.dateAudience,
  dateFin: d.dateAudience,
  lieu: d.lieu || '',
  statut: d.statut,
  dossierId: { _id: d._id, numero: d.numero, titre: d.titre, typeAffaire: d.typeAffaire },
  description: `Audience du dossier ${d.numero || ''}`,
  createdBy: d.createdBy
});

exports.getAudiences = async (req, res) => {
  try {
    const calendrierQuery = { type: 'audience' };
    const scope = await buildCalendrierScopeForUser(req.user);
    if (Object.keys(scope).length > 0) {
      Object.assign(calendrierQuery, scope);
    }

    const [calendrierEvents, dossierAudiences] = await Promise.all([
      Calendrier.find(calendrierQuery)
        .populate('dossierId', 'numero titre typeAffaire')
        .populate('assignes', 'nom prenom')
        .lean(),

      Dossier.find({
        ...(await buildDossierScopeForUser(req.user)),
        dateAudience: { $ne: null, $exists: true }
      })
        .select('numero titre typeAffaire dateAudience lieu statut createdBy')
        .lean()
    ]);

    const dossiersAsAudiences = dossierAudiences.map(formatDossierAsAudience);

    const merged = [...calendrierEvents, ...dossiersAsAudiences].sort((a, b) => {
      const da = new Date(a.dateDebut).getTime();
      const db = new Date(b.dateDebut).getTime();
      return da - db;
    });

    res.json(merged);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audiences', error: error.message });
  }
};