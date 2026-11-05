const express = require('express');
const router = express.Router();
const {
  createJoinRequest,
  getReceivedRequests,
  getSentRequests,
  respondToJoinRequest
} = require('../controllers/joinRequestController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createJoinRequest);
router.get('/received', getReceivedRequests);
router.get('/sent', getSentRequests);
router.put('/:id/respond', respondToJoinRequest);

module.exports = router;
