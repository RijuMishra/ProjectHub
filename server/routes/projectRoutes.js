const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getMyProjects,
  getDashboardStats
} = require('../controllers/projectController');
const { updateOrRemoveMember } = require('../controllers/joinRequestController');
const { protect } = require('../middleware/auth');

// Optional auth helper to attach req.user if token is present for public/private check
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'projecthub_jwt_super_secret_key_2026_academic_demo');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignore token failure for optional endpoints
    }
  }
  next();
};

router.get('/', getProjects);
router.get('/my', protect, getMyProjects);
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/:id', optionalAuth, getProjectById);
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.put('/:projectId/members/:memberId', protect, updateOrRemoveMember);

module.exports = router;
