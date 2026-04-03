const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    required: true, 
    enum: ['student', 'sic', 'admin', 'worker'] 
  },
  // Unified Block field
  block: { type: String }, 
  
  // Role-specific fields (Optional based on role)
  registrationNumber: { type: String }, // Student
  roomNumber: { type: String },         // Student
  sicId: { type: String },              // SIC
  staffId: { type: String },            // Worker
  sector: { type: String },             // Worker
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);