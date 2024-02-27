const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  titre: String,
  description: String,
  lieu: String,
  organisateur: String,
});

module.exports = mongoose.model('Event', eventSchema);
