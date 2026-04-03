

const ServiceRequest = require('../models/ServiceRequest');
const Personnel = require('../models/Personnel');
// 1. Create Request
// @route   POST /api/requests
exports.createRequest = async (req, res) => {
  try {
    const { category, description } = req.body;
    const block = req.user.block;
    // Check if user is attached from protect middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }

    const newRequest = await ServiceRequest.create({
      category,
      description,
      block,
      student: req.user._id, // LINKS THE REQUEST TO THE LOGGED-IN STUDENT
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 2. Get My Requests (For Student Dashboard)
// @route   GET /api/requests/my
exports.getMyRequests = async (req, res) => {
  try {
    // Find only the requests where 'student' field matches current user ID
    const requests = await ServiceRequest.find({ student: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get All Requests (For SIC/Admin Dashboard)
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find()
      .populate('student', 'name roomNumber registrationNumber')
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Update Status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Update the document in MongoDB
    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // 2. Send back the updated data so the frontend stops "Loading"
    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Server error during update" });
  }
};

// Function to mark a request as Resolved and free up the worker
exports.resolveRequest = async (req, res) => {
  console.log("1. Starting resolution for Request:", req.params.id);
  
  const request = await ServiceRequest.findById(req.params.id);
  const workerId = request.assignedStaff;
  
  console.log("2. Found assigned worker:", workerId);

  request.status = 'Resolved';
  await request.save();
  console.log("3. Request status updated in DB.");

  if (workerId) {
    const updatedWorker = await Personnel.findByIdAndUpdate(workerId, {
      currentStatus: 'Online',
      activeRoom: ""
    }, { new: true });
    console.log("4. Worker updated to Online:", updatedWorker.currentStatus);
  } else {
    console.log("⚠️ No worker was linked to this request!");
  }

  res.status(200).json({ success: true });
};

exports.assignWorker = async (req, res) => {
  try {
    const { workerId } = req.body;
    const requestId = req.params.id;

    // 1. Find the Request and get the student's room
    const request = await ServiceRequest.findById(requestId).populate('student');
    if (!request) return res.status(404).json({ message: "Request not found" });

    const roomToAssign = request.student?.roomNumber || "N/A";

    // 2. Update Request Status
    request.status = 'In Progress';
    request.assignedStaff = workerId; 
    await request.save();

    // 3. Update Personnel Status and Room
    await Personnel.findByIdAndUpdate(workerId, {
      currentStatus: 'Busy',
      activeRoom: roomToAssign,
      $inc: { activeTasks: 1 }
    });

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Assignment Error:", error);
    res.status(500).json({ message: "Server error during assignment" });
  }
};