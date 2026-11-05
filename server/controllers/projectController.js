const Project = require('../models/Project');
const Task = require('../models/Task');
const JoinRequest = require('../models/JoinRequest');
const Resource = require('../models/Resource');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// @desc    Get all public projects with filter, search & sort
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res, next) => {
  try {
    const { search, category, status, sort } = req.query;

    const query = { visibility: 'Public' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { technologies: searchRegex },
        { requiredSkills: searchRegex }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'title') sortOption = { title: 1 };

    const projects = await Project.find(query)
      .populate('owner', 'name email department avatar')
      .populate('members.user', 'name email department avatar')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Public / Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email department year skills bio avatar')
      .populate('members.user', 'name email department year skills bio avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check private project visibility
    if (project.visibility === 'Private') {
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: 'This project is private. Please log in to view.'
        });
      }
      const isOwner = project.owner._id.toString() === req.user.id;
      const isMember = project.members.some(m => m.user._id.toString() === req.user.id);
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isMember && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this private project.'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      technologies,
      requiredSkills,
      maxTeamSize,
      status,
      visibility,
      repoUrl,
      liveDemoUrl
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description and category'
      });
    }

    const techArray = Array.isArray(technologies)
      ? technologies
      : technologies ? technologies.split(',').map(t => t.trim()).filter(Boolean) : [];

    const skillsArray = Array.isArray(requiredSkills)
      ? requiredSkills
      : requiredSkills ? requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : [];

    const project = await Project.create({
      title,
      description,
      category,
      technologies: techArray,
      requiredSkills: skillsArray,
      maxTeamSize: maxTeamSize ? Number(maxTeamSize) : 4,
      status: status || 'Planning',
      visibility: visibility || 'Public',
      owner: req.user.id,
      repoUrl: repoUrl || '',
      liveDemoUrl: liveDemoUrl || '',
      members: []
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email department avatar');

    res.status(201).json({
      success: true,
      data: populatedProject
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Owner or Admin)
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const projectOwnerId = (project.owner?._id || project.owner)?.toString();
    const isOwner = projectOwnerId === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator or an administrator can edit this project.'
      });
    }

    const {
      title,
      description,
      category,
      technologies,
      requiredSkills,
      maxTeamSize,
      status,
      visibility,
      repoUrl,
      liveDemoUrl
    } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (status) project.status = status;
    if (visibility) project.visibility = visibility;
    if (repoUrl !== undefined) project.repoUrl = repoUrl;
    if (liveDemoUrl !== undefined) project.liveDemoUrl = liveDemoUrl;
    if (maxTeamSize) project.maxTeamSize = Number(maxTeamSize);

    if (technologies !== undefined) {
      project.technologies = Array.isArray(technologies)
        ? technologies
        : technologies.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (requiredSkills !== undefined) {
      project.requiredSkills = Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email department avatar')
      .populate('members.user', 'name email department avatar');

    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner or Admin)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const projectOwnerId = (project.owner?._id || project.owner)?.toString();
    const isOwner = projectOwnerId === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator or an administrator can delete this project.'
      });
    }

    // Cascade delete tasks, join requests, comments
    await Task.deleteMany({ project: project._id });
    await JoinRequest.deleteMany({ project: project._id });
    await Comment.deleteMany({ project: project._id });

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project and associated tasks, requests, and discussions removed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's own projects and joined projects
// @route   GET /api/projects/my
// @access  Private
exports.getMyProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const ownedProjects = await Project.find({ owner: userId })
      .populate('owner', 'name email department avatar')
      .populate('members.user', 'name email department avatar')
      .sort({ createdAt: -1 });

    const joinedProjects = await Project.find({
      'members.user': userId,
      owner: { $ne: userId }
    })
      .populate('owner', 'name email department avatar')
      .populate('members.user', 'name email department avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        owned: ownedProjects,
        joined: joinedProjects,
        total: ownedProjects.length + joinedProjects.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard metrics for authenticated student
// @route   GET /api/projects/dashboard-stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Total created projects
    const totalCreated = await Project.countDocuments({ owner: userId });

    // Total joined projects (as team member)
    const totalJoined = await Project.countDocuments({ 'members.user': userId });

    // Pending collaboration requests for projects owned by user
    const userOwnedProjects = await Project.find({ owner: userId }).select('_id');
    const ownedProjectIds = userOwnedProjects.map(p => p._id);

    const pendingRequestsCount = await JoinRequest.countDocuments({
      project: { $in: ownedProjectIds },
      status: 'pending'
    });

    // Assigned tasks
    const assignedTasks = await Task.find({ assignedTo: userId })
      .populate('project', 'title category status');

    const totalTasks = assignedTasks.length;
    const completedTasks = assignedTasks.filter(t => t.status === 'Completed').length;
    const taskProgressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Recently created public projects
    const recentProjects = await Project.find({ visibility: 'Public' })
      .populate('owner', 'name email department avatar')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 })
      .limit(4);

    // Recently uploaded resources
    const recentResources = await Resource.find()
      .populate('uploader', 'name department avatar')
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      data: {
        totalProjectsCreated: totalCreated,
        totalProjectsJoined: totalJoined,
        pendingCollaborationRequests: pendingRequestsCount,
        assignedTasksCount: totalTasks,
        completedTasksCount: completedTasks,
        taskCompletionPercentage: taskProgressPercentage,
        assignedTasksList: assignedTasks.slice(0, 5),
        recentProjects,
        recentResources
      }
    });
  } catch (err) {
    next(err);
  }
};
