const express = require('express');
const router = express.Router();
const {
  getTasksByProject,
  getMyTasks,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.get('/project/:projectId', getTasksByProject);
router.get('/my-tasks', protect, getMyTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
