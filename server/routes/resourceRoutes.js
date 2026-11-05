const express = require('express');
const router = express.Router();
const {
  getResources,
  uploadResource,
  downloadResource,
  deleteResource
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getResources);
router.get('/:id/download', downloadResource);
router.post('/', protect, upload.single('file'), uploadResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
