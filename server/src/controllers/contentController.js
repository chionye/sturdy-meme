const { Executive, Event, HeroSlide } = require('../models');
const { Op } = require('sequelize');

// ===================== EXECUTIVES =====================

const getAllExecutives = async (req, res) => {
  try {
    const { state } = req.query;
    const where = {};
    if (state) where.state = state;
    const executives = await Executive.findAll({
      where,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });
    res.json(executives);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createExecutive = async (req, res) => {
  try {
    const { name, businessName, office, position, state, isBoardMember } = req.body;
    if (!name || !position || !state) {
      return res.status(400).json({ message: 'Name, position and state are required' });
    }
    const executive = await Executive.create({
      name,
      businessName,
      office,
      position,
      state,
      isBoardMember: isBoardMember === 'true' || isBoardMember === true,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      order: req.body.order || 0,
    });
    res.status(201).json(executive);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateExecutive = async (req, res) => {
  try {
    const executive = await Executive.findByPk(req.params.id);
    if (!executive) return res.status(404).json({ message: 'Executive not found' });

    const { name, businessName, office, position, state, isBoardMember, order } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (businessName !== undefined) updates.businessName = businessName;
    if (office !== undefined) updates.office = office;
    if (position) updates.position = position;
    if (state) updates.state = state;
    if (isBoardMember !== undefined) updates.isBoardMember = isBoardMember === 'true' || isBoardMember === true;
    if (order !== undefined) updates.order = order;
    if (req.file) updates.image = `/uploads/${req.file.filename}`;

    await executive.update(updates);
    res.json(executive);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteExecutive = async (req, res) => {
  try {
    const executive = await Executive.findByPk(req.params.id);
    if (!executive) return res.status(404).json({ message: 'Executive not found' });
    await executive.destroy();
    res.json({ message: 'Executive deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== EVENTS =====================

const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const events = await Event.findAll({
      where,
      order: [['date', 'DESC']],
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date, endDate, location, status } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (req.body.images) {
      try { images = JSON.parse(req.body.images); } catch { images = []; }
    }

    const event = await Event.create({
      title,
      description,
      date,
      endDate,
      location,
      images,
      status: status || 'upcoming',
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const { title, description, date, endDate, location, status } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (date) updates.date = date;
    if (endDate !== undefined) updates.endDate = endDate;
    if (location !== undefined) updates.location = location;
    if (status) updates.status = status;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      let existingImages = event.images || [];
      if (Array.isArray(existingImages)) {
        updates.images = [...existingImages, ...newImages];
      } else {
        updates.images = newImages;
      }
    }

    await event.update(updates);
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== HERO SLIDES =====================

const getAllHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.findAll({
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getActiveHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createHeroSlide = async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    const slide = await HeroSlide.create({
      image: `/uploads/${req.file.filename}`,
      title,
      subtitle,
      isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : true,
      order: req.body.order || 0,
    });
    res.status(201).json(slide);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByPk(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });

    const { title, subtitle, isActive, order } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (isActive !== undefined) updates.isActive = isActive === 'true' || isActive === true;
    if (order !== undefined) updates.order = parseInt(order);
    if (req.file) updates.image = `/uploads/${req.file.filename}`;

    await slide.update(updates);
    res.json(slide);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByPk(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    await slide.destroy();
    res.json({ message: 'Slide deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllExecutives, createExecutive, updateExecutive, deleteExecutive,
  getEventById, getAllEvents, createEvent, updateEvent, deleteEvent,
  getAllHeroSlides, getActiveHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide,
};
