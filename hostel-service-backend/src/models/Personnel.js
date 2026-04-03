const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const personnelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  staffId: { type: String, required: true, unique: true },
  sector: { type: String },
  assignedBlock: { type: String },
  currentStatus: { type: String, default: 'Online' },
  activeTasks: { type: Number, default: 0 },
  activeRoom: {type: String},
});

personnelSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

personnelSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Personnel', personnelSchema);