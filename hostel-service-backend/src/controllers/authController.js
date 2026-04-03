
const User = require('../models/User');
const Personnel = require('../models/Personnel');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');

// @desc    Auth user & get token
// @route   POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  const worker = await Personnel.findOne({ email }).select('+password');
  const foundUser = user || worker;
  if (foundUser && (await foundUser.matchPassword(password))) {
    res.json({
      _id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      token: generateToken(foundUser._id),
      block: foundUser.block,
      roomNumber: foundUser.roomNumber,
      registrationNumber: foundUser.registrationNumber,
      assignedBlock: foundUser.assignedBlock,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user (Admin only)
// @route   POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, registrationNumber, password, role, roomNumber, sector, block, department } = req.body;

  // 🕵️‍♂️ Check BOTH collections
  const userExists = await User.findOne({ email });
  const workerExists = await Personnel.findOne({ email });

  if (userExists || workerExists) {
    res.status(400);
    throw new Error('User already exists in our system');
  }

  // 🚀 Logic to decide which collection to save to
  if (role === 'worker' || role === 'sic') {
    const worker = await Personnel.create({
      name,
      email,
      password,
      role,
      sector,
      assignedBlock: block, // Maps 'block' to 'assignedBlock' for personnel
      staffId: req.body.staffId,
    });

    if (worker) {
       return res.status(201).json({
        _id: worker._id,
        name: worker.name,
        role: worker.role,
        staffId: worker.staffId,
        sector: worker.sector,
        assignedBlock: worker.assignedBlock,
        activeRoom: "",
      });
    }
  } else {
    // Default to saving in the User collection (for students/admin)
    const user = await User.create({
      name, email, registrationNumber, password, role, roomNumber, block
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        role: user.role,
      });
    }
  }

  res.status(400);
  throw new Error('Invalid user data');
});

const deleteUser = asyncHandler(async (req, res) => {
  // Try to find in both
  const user = await User.findById(req.params.id);
  const worker = await Personnel.findById(req.params.id);

  const target = user || worker;

  if (target) {
    await target.deleteOne();
    res.json({ message: 'User removed successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
// Update your exports at the bottom:
module.exports = { loginUser, registerUser, deleteUser };