const express = require('express');
const router = express.Router();
const Event = require('../models/event');

router.post('/events/add', async (req, res) => {
    console.log('Requête POST reçue avec les données :', req.body);
  
    try {
      const event = new Event(req.body);
      await event.save();
      console.log('Événement sauvegardé avec succès :', event);
      res.status(201).send(event);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'événement :', error);
      res.status(400).send(error);
    }
  });

// Route pour récupérer tous les événements
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.send(events);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route pour récupérer un événement par son ID
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send();
    }
    res.send(event);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route pour mettre à jour un événement par son ID
router.patch('/events/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['titre', 'description', 'dateDebut', 'dateFin', 'lieu', 'organisateur', 'participants'];

  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) {
      return res.status(404).send();
    }
    res.send(event);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route pour supprimer un événement par son ID
router.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).send();
    }
    res.send(event);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
