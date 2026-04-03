const Personnel = require('../models/Personnel');

// Get all staff for the Maintenance Directory
exports.getAllPersonnel = async (req, res) => {
  try {
    const staff = await Personnel.find();
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Error fetching personnel" });
  }
};

// Update status (e.g., changing from Online to Busy)
exports.updatePersonnelStatus = async (req, res) => {
  try {
    const staff = await Personnel.findByIdAndUpdate(
      req.params.id,
      req.body, // Expecting { currentStatus: 'Busy', assignedBlock: 'Q-Block' }
      { new: true }
    );
    res.status(200).json(staff);
  } catch (error) {
    res.status(400).json({ message: "Update failed" });
  }
};

exports.manualAssign = async (req, res) => {
  try {
    const { room } = req.body; // Extract 'room' from the frontend taskData
    const staffId = req.params.id;

    const updatedStaff = await Personnel.findByIdAndUpdate(
      staffId,
      { 
        currentStatus: 'Busy', // Change status to Busy
        activeRoom: room       // Save the room number/floor
      },
      { new: true }
    );

    if (!updatedStaff) return res.status(404).json({ message: "Staff not found" });
    
    res.status(200).json(updatedStaff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};