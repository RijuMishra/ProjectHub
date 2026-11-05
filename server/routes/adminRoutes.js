const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  deleteUser,
  getAllProjects,
  deleteProjectAdmin,
  getAllResources,
  deleteResourceAdmin
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/projects', getAllProjects);
router.delete('/projects/:id', deleteProjectAdmin);
router.get('/resources', getAllResources);
router.delete('/resources/:id', deleteResourceAdmin);

module.exports = router;
