const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// Helper to verify if user is member or owner of the project
const verifyProjectAccess = async (projectId, userId, role) => {
  if (role === 'admin') return true;
  const project = await Project.findById(projectId);
  if (!project) return null;
  const uId = (userId?._id || userId)?.toString();
  const projectOwnerId = (project.owner?._id || project.owner)?.toString();
  const isOwner = projectOwnerId === uId;
  const isMember = project.members && project.members.some(m => (m.user?._id || m.user)?.toString() === uId);
  return isOwner || isMember ? project : false;
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private / Public (if project is public)
exports.getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email department avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all tasks assigned to current user
// @route   GET /api/tasks/my-tasks
// @access  Private
exports.getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('project', 'title category status owner')
      .populate('createdBy', 'name email avatar')
      .sort({ deadline: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a task for a project
// @route   POST /api/tasks
// @access  Private (Team members or Owner)
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, priority, status, deadline } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Title and Project ID are required'
      });
    }

    const projectAccess = await verifyProjectAccess(projectId, req.user.id, req.user.role);
    if (projectAccess === null) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (projectAccess === false) {
      return res.status(403).json({
        success: false,
        message: 'Only project team members or the owner can create tasks for this project.'
      });
    }

    const task = await Task.create({
      title,
      description: description || '',
      project: projectId,
      assignedTo: assignedTo || null,
      priority: priority || 'Medium',
      status: status || 'To Do',
      deadline: deadline || null,
      createdBy: req.user.id
    });

    // Notify assigned member if assigned
    if (assignedTo && assignedTo.toString() !== req.user.id) {
      await Notification.create({
        recipient: assignedTo,
        sender: req.user.id,
        type: 'task_assigned',
        message: `${req.user.name} assigned you a new task: "${task.title}" in project "${projectAccess.title}".`,
        link: `/tasks?projectId=${projectId}`
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email department avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title category');

    res.status(201).json({
      success: true,
      data: populatedTask,
      message: 'Task created successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task (status, priority, assignment, etc.)
// @route   PUT /api/tasks/:id
// @access  Private (Team members, Assignee, Owner)
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const projectAccess = await verifyProjectAccess(task.project, req.user.id, req.user.role);
    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update tasks for this project.'
      });
    }

    const { title, description, assignedTo, priority, status, deadline } = req.body;

    const previousStatus = task.status;
    const previousAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (deadline !== undefined) task.deadline = deadline || null;

    await task.save();

    // Notify on status change
    if (status && status !== previousStatus && task.createdBy.toString() !== req.user.id) {
      await Notification.create({
        recipient: task.createdBy,
        sender: req.user.id,
        type: 'task_status_changed',
        message: `${req.user.name} moved task "${task.title}" to ${status}.`,
        link: `/tasks?projectId=${task.project}`
      });
    }

    // Notify new assignee if changed
    if (assignedTo && assignedTo !== previousAssignee && assignedTo.toString() !== req.user.id) {
      await Notification.create({
        recipient: assignedTo,
        sender: req.user.id,
        type: 'task_assigned',
        message: `${req.user.name} assigned you the task: "${task.title}".`,
        link: `/tasks?projectId=${task.project}`
      });
    }

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email department avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title category');

    res.status(200).json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Owner, Creator or Admin)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const uId = (req.user?._id || req.user?.id)?.toString();
    const isOwner = project && (project.owner?._id || project.owner)?.toString() === uId;
    const isCreator = (task.createdBy?._id || task.createdBy)?.toString() === uId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner, task creator, or admin can delete this task.'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};
