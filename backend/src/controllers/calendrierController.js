const Calendrier = require('../models/Calendrier');
const Operation = require('../models/Operation');

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
      query.dateDebut = { $gte: new Date(start), $lte: new Date(end) };
    }

    if (userId) query.$or = [{ userId }, { assignes: userId }];
    if (type) query.type = type;
    if (dossierId) query.dossierId = dossierId;

    const events = await Calendrier.find(query)
      .populate('userId', 'nom prenom')
      .populate('assignes', 'nom prenom')
      .populate('dossierId', 'numero titre')
      .sort({ dateDebut: 1 });

    res.json(events);
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
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
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
    await Calendrier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

exports.getAudiences = async (req, res) => {
  try {
    const events = await Calendrier.find({ type: 'audience' })
      .populate('dossierId', 'numero titre typeAffaire')
      .populate('assignes', 'nom prenom')
      .sort({ dateDebut: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audiences', error: error.message });
  }
};