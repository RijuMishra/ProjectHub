const JoinRequest = require('../models/JoinRequest');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// @desc    Submit request to join a project
// @route   POST /api/join-requests
// @access  Private
exports.createJoinRequest = async (req, res, next) => {
  try {
    const { projectId, message, proposedRole } = req.body;
    const applicantId = req.user.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const projectOwnerId = (project.owner?._id || project.owner)?.toString();
    // Owner cannot request to join their own project
    if (projectOwnerId === applicantId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You are the creator and owner of this project.'
      });
    }

    // Check if already a member
    const isMember = project.members && project.members.some(m => (m.user?._id || m.user)?.toString() === applicantId.toString());
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already an active team member of this project.'
      });
    }

    // Check if team is full
    const currentTeamCount = project.members.length + 1; // owner + members
    if (currentTeamCount >= project.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: `This project has reached its maximum team capacity of ${project.maxTeamSize} members.`
      });
    }

    // Check for existing pending request
    const existingRequest = await JoinRequest.findOne({
      project: projectId,
      applicant: applicantId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending join request for this project.'
      });
    }

    const joinRequest = await JoinRequest.create({
      project: projectId,
      applicant: applicantId,
      message: message || `Hi! I would love to collaborate on ${project.title}.`,
      proposedRole: proposedRole || 'Collaborator',
      status: 'pending'
    });

    // Notify project owner
    await Notification.create({
      recipient: project.owner,
      sender: applicantId,
      type: 'join_request',
      message: `${req.user.name} sent a collaboration request to join "${project.title}".`,
      link: `/teams`
    });

    const populatedRequest = await JoinRequest.findById(joinRequest._id)
      .populate('applicant', 'name email department year skills avatar')
      .populate('project', 'title category owner');

    res.status(201).json({
      success: true,
      data: populatedRequest,
      message: 'Join request submitted successfully to the project owner.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get pending requests for projects owned by current user
// @route   GET /api/join-requests/received
// @access  Private
exports.getReceivedRequests = async (req, res, next) => {
  try {
    const userOwnedProjects = await Project.find({ owner: req.user.id }).select('_id');
    const projectIds = userOwnedProjects.map(p => p._id);

    const requests = await JoinRequest.find({
      project: { $in: projectIds },
      status: 'pending'
    })
      .populate('applicant', 'name email department year skills bio avatar')
      .populate('project', 'title category maxTeamSize members')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get requests sent by current user
// @route   GET /api/join-requests/sent
// @access  Private
exports.getSentRequests = async (req, res, next) => {
  try {
    const requests = await JoinRequest.find({ applicant: req.user.id })
      .populate('project', 'title category status owner maxTeamSize')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Respond to join request (Accept or Reject)
// @route   PUT /api/join-requests/:id/respond
// @access  Private (Project Owner or Admin)
exports.respondToJoinRequest = async (req, res, next) => {
  try {
    const { status, role } = req.body; // status: 'accepted' | 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either accepted or rejected'
      });
    }

    const joinRequest = await JoinRequest.findById(req.params.id)
      .populate('project');

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    const project = await Project.findById(joinRequest.project._id || joinRequest.project);
    const projectOwnerId = (project.owner?._id || project.owner)?.toString();
    const isOwner = projectOwnerId === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner or admin can respond to this collaboration request.'
      });
    }

    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request has already been marked as ${joinRequest.status}.`
      });
    }

    if (status === 'accepted') {
      // Check capacity
      const currentTeamCount = project.members.length + 1;
      if (currentTeamCount >= project.maxTeamSize) {
        return res.status(400).json({
          success: false,
          message: `Cannot accept request. Team has reached maximum capacity of ${project.maxTeamSize} members.`
        });
      }

      // Check if already in members
      const alreadyMember = project.members.some(
        m => m.user.toString() === joinRequest.applicant.toString()
      );

      if (!alreadyMember) {
        project.members.push({
          user: joinRequest.applicant,
          role: role || joinRequest.proposedRole || 'Collaborator',
          joinedAt: new Date()
        });
        await project.save();
      }

      joinRequest.status = 'accepted';
      await joinRequest.save();

      // Notify applicant
      await Notification.create({
        recipient: joinRequest.applicant,
        sender: req.user.id,
        type: 'request_accepted',
        message: `Congratulations! Your request to join "${project.title}" has been accepted.`,
        link: `/projects/${project._id}`
      });
    } else {
      joinRequest.status = 'rejected';
      await joinRequest.save();

      // Notify applicant
      await Notification.create({
        recipient: joinRequest.applicant,
        sender: req.user.id,
        type: 'request_rejected',
        message: `Your request to join "${project.title}" was not accepted at this time.`,
        link: `/explore`
      });
    }

    res.status(200).json({
      success: true,
      message: `Collaboration request successfully ${status}.`,
      data: joinRequest
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a member role or remove member
// @route   PUT /api/projects/:projectId/members/:memberId
// @access  Private (Project Owner or Admin)
exports.updateOrRemoveMember = async (req, res, next) => {
  try {
    const { projectId, memberId } = req.params;
    const { role, remove } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const projectOwnerId = (project.owner?._id || project.owner)?.toString();
    const isOwner = projectOwnerId === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can modify team members.'
      });
    }

    if (remove) {
      project.members = project.members.filter(m => m.user.toString() !== memberId);
      await project.save();

      await Notification.create({
        recipient: memberId,
        sender: req.user.id,
        type: 'general',
        message: `You were removed from the project team: "${project.title}".`,
        link: `/projects`
      });

      return res.status(200).json({
        success: true,
        message: 'Member removed from project team.',
        data: project
      });
    }

    if (role) {
      const member = project.members.find(m => m.user.toString() === memberId);
      if (member) {
        member.role = role;
        await project.save();
      }
      return res.status(200).json({
        success: true,
        message: 'Member role updated successfully.',
        data: project
      });
    }

    res.status(400).json({ success: false, message: 'No action specified.' });
  } catch (err) {
    next(err);
  }
};
