const Comment = require('../models/Comment');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// @desc    Get comments for a project
// @route   GET /api/comments/project/:projectId
// @access  Public / Private
exports.getCommentsByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const comments = await Comment.find({ project: projectId })
      .populate('author', 'name email department avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to project discussion
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res, next) => {
  try {
    const { content, projectId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    const comment = await Comment.create({
      content: content.trim(),
      project: projectId,
      author: req.user.id
    });

    // Notify project owner if someone else commented
    const projectOwnerId = (project.owner?._id || project.owner)?.toString();
    const uId = (req.user?._id || req.user?.id)?.toString();
    if (projectOwnerId && projectOwnerId !== uId) {
      await Notification.create({
        recipient: projectOwnerId,
        sender: uId,
        type: 'new_comment',
        message: `${req.user.name} posted in the discussion for "${project.title}".`,
        link: `/projects/${project._id}#discussions`
      });
    }

    const populated = await Comment.findById(comment._id)
      .populate('author', 'name email department avatar');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Comment posted.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Author or Admin)
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.'
      });
    }

    const isAuthor = comment.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the author of this comment or an administrator can delete it.'
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment removed successfully.'
    });
  } catch (err) {
    next(err);
  }
};
