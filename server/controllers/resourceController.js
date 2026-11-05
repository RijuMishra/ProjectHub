const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const { isCloudinaryConfigured, cloudinary } = require('../config/cloudinary');

// @desc    Get all resources with search & category filter
// @route   GET /api/resources
// @access  Public / Private
exports.getResources = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { fileName: searchRegex }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'downloads') sortOption = { downloadsCount: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'title') sortOption = { title: 1 };

    const resources = await Resource.find(query)
      .populate('uploader', 'name department avatar email')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private
exports.uploadResource = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a file to upload.'
      });
    }

    const { title, description, category, tags } = req.body;

    if (!title) {
      // Remove temporary file if validation fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Title is required for resource upload.'
      });
    }

    let fileUrl = '';
    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();

    // Check Cloudinary or fallback to local
    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'auto',
          folder: 'projecthub_resources'
        });
        fileUrl = uploadResult.secure_url;
        // Delete local temp file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cloudErr) {
        console.warn('[Storage] Cloudinary upload failed, falling back to local storage URL:', cloudErr.message);
        fileUrl = `/uploads/${req.file.filename}`;
      }
    } else {
      // Local storage URL served by Express static
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const tagsArray = Array.isArray(tags)
      ? tags
      : tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const resource = await Resource.create({
      title,
      description: description || '',
      category: category || 'Notes',
      tags: tagsArray,
      fileUrl,
      fileName: req.file.originalname,
      fileType: ext,
      fileSize: req.file.size,
      uploader: req.user.id
    });

    const populated = await Resource.findById(resource._id)
      .populate('uploader', 'name department avatar');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Resource uploaded successfully.'
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(err);
  }
};

// @desc    Download resource file
// @route   GET /api/resources/:id/download
// @access  Public / Private
exports.downloadResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment downloads count
    resource.downloadsCount = (resource.downloadsCount || 0) + 1;
    await resource.save();

    // If Cloudinary external URL
    if (resource.fileUrl.startsWith('http')) {
      return res.redirect(resource.fileUrl);
    }

    // Local file path
    const localFileName = path.basename(resource.fileUrl);
    const localFilePath = path.join(__dirname, '..', 'uploads', localFileName);

    if (!fs.existsSync(localFilePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on local storage.'
      });
    }

    res.download(localFilePath, resource.fileName);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Uploader or Admin)
exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const isUploader = resource.uploader.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isUploader && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the uploader or an administrator can delete this resource.'
      });
    }

    // Delete local file if exists
    if (!resource.fileUrl.startsWith('http')) {
      const localFileName = path.basename(resource.fileUrl);
      const localFilePath = path.join(__dirname, '..', 'uploads', localFileName);
      if (fs.existsSync(localFilePath)) {
        try { fs.unlinkSync(localFilePath); } catch (e) {}
      }
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};
