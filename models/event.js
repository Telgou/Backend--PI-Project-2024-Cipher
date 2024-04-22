// Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  titre: String,
  description: String,
  lieu: String,
  organisateur: String,
  dateDebut: Date,        // Ajout de la date de début (utilisation du type Date)
  dateFin: Date,          // Ajout de la date de fin (utilisation du type Date)
  participants: [String],
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
