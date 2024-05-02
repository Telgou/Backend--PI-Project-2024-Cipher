import express from "express";
import { createEvent } from "../controllers/event.js";
import { verifyToken } from "../middleware/auth.js";
import { participateInEvent } from "../controllers/event.js"; // Importer la fonction pour participer à un événement

import {
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/event.js';

const router = express.Router();

/* CREATE */

router.get('/getEvents',getAllEvents);

router.get('/getEvent/:id', getEventById);

router.patch('/updateEvents/:id', updateEvent);

router.delete('/deleteEvents/:id', deleteEvent);
//router.post("/events/add", verifyToken, createEvent);
router.post("/events/:eventId/participate", participateInEvent);

export default router;
