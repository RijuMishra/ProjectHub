const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Get all students (for directory / team finder)
// @route   GET /api/users
// @access  Private / Public
exports.getAllStudents = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const query = { role: 'student' };

    if (department && department !== 'All') {
      query.department = department;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { department: regex },
        { skills: regex }
      ];
    }

    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get public profile of a user with projects
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const createdProjects = await Project.find({
      owner: user._id,
      visibility: 'Public'
    }).select('title category status technologies members createdAt');

    const joinedProjects = await Project.find({
      'members.user': user._id,
      owner: { $ne: user._id },
      visibility: 'Public'
    }).select('title category status technologies members createdAt');

    res.status(200).json({
      success: true,
      data: {
        user,
        createdProjects,
        joinedProjects
      }
    });
  } catch (err) {
    next(err);
  }
};
