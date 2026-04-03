const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionTaken: { type: String, required: true }, // e.g., "Replaced tube light"
  hoursSpent: { type: Number },
  partsUsed: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);