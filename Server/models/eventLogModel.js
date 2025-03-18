// File Path: /models/eventLogModel.js

const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

const EventLog = mongoose.model('EventLog', eventLogSchema);
module.exports = EventLog;
