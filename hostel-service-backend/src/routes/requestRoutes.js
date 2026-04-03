const requestController = require('../controllers/requestController')
const express = require('express');
const { 
  resolveRequest, 
  assignStaff,
  createRequest, 
  getMyRequests, 
  getAllRequests, 
  updateRequestStatus 
} = require('../controllers/requestController');
const personnelController = require('../controllers/personnelController');

const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// Request Endpoints
router.route('/')
  .post(protect, authorize('student'), createRequest)
  .get(protect, authorize('admin', 'sic'), getAllRequests);

// 1. Specific Static Routes First
router.route('/my').get(protect, authorize('student'), getMyRequests);

// 2. Personnel Routes (Move these up)
router.route('/personnel')
  .get(protect, authorize('admin', 'sic'), personnelController.getAllPersonnel);

router.patch('/personnel/:id/manual-assign', personnelController.manualAssign); // Moved Up

router.route('/personnel/:id')
  .patch(protect, authorize('admin', 'sic'), personnelController.updatePersonnelStatus);

// 3. Generic ID Routes (Move these down)
router.route('/:id')
  .patch(protect, authorize('admin', 'sic'), updateRequestStatus);

router.patch('/:id/resolve', protect, requestController.resolveRequest);
router.patch('/:id/assign', protect, requestController.assignWorker);

module.exports = router;

