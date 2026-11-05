const express = require('express');
const router = express.Router();
const {
  getCommentsByProject,
  createComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/project/:projectId', getCommentsByProject);
router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
