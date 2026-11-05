const User = require('../models/User');
const Project = require('../models/Project');
const Resource = require('../models/Resource');
const Task = require('../models/Task');
const JoinRequest = require('../models/JoinRequest');
const Comment = require('../models/Comment');

// @desc    Get comprehensive admin platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentUsers = await User.countDocuments({ role: 'student' });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    const totalProjects = await Project.countDocuments();
    const publicProjects = await Project.countDocuments({ visibility: 'Public' });
    const privateProjects = await Project.countDocuments({ visibility: 'Private' });

    const totalResources = await Resource.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Completed' });

    // Category breakdown
    const categoryStats = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Resource category breakdown
    const resourceStats = await Resource.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        studentUsers,
        adminUsers,
        totalProjects,
        publicProjects,
        privateProjects,
        totalResources,
        totalTasks,
        completedTasks,
        categoryStats,
        resourceStats
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users with project counts
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const projectCount = await Project.countDocuments({ owner: u._id });
        const resourceCount = await Resource.countDocuments({ uploader: u._id });
        return {
          ...u.toObject(),
          projectCount,
          resourceCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Administrator cannot delete their own account from the portal.'
      });
    }

    // Clean up user's data
    await Project.deleteMany({ owner: user._id });
    await Resource.deleteMany({ uploader: user._id });
    await Task.deleteMany({ createdBy: user._id });
    await Comment.deleteMany({ author: user._id });
    await JoinRequest.deleteMany({ applicant: user._id });

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: `User ${user.name} and all related items removed.`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all projects for admin
// @route   GET /api/admin/projects
// @access  Private (Admin only)
exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'name email department')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete project as admin
// @route   DELETE /api/admin/projects/:id
// @access  Private (Admin only)
exports.deleteProjectAdmin = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await Task.deleteMany({ project: project._id });
    await JoinRequest.deleteMany({ project: project._id });
    await Comment.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project and all associated data deleted by administrator.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all resources for admin
// @route   GET /api/admin/resources
// @access  Private (Admin only)
exports.getAllResources = async (req, res, next) => {
  try {
    const resources = await Resource.find()
      .populate('uploader', 'name email department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete resource as admin
// @route   DELETE /api/admin/resources/:id
// @access  Private (Admin only)
exports.deleteResourceAdmin = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource removed by administrator.'
    });
  } catch (err) {
    next(err);
  }
};
