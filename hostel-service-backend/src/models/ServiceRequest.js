const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  block: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Electrical', 'Plumbing', 'General', 'Cleaning'], 
    required: true 
  },
  description: { type: String, required: true },
  imageUrl: { type: String, default: "" }, // Optional for now
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved'], 
    default: 'Pending' 
  },
  assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'Personnel' },
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);