const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getUserProfile
} = require('../controllers/userController');

router.get('/', getAllStudents);
router.get('/:id', getUserProfile);

module.exports = router;
