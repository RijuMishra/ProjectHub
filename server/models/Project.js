const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');
const { createModelMock } = require('../config/localStore');

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      default: 'Collaborator',
      trim: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a project description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Web Development',
        'AI/ML',
        'Data Science',
        'App Development',
        'IoT',
        'Cybersecurity',
        'Other'
      ],
      default: 'Web Development'
    },
    technologies: {
      type: [String],
      default: []
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    maxTeamSize: {
      type: Number,
      required: [true, 'Please specify maximum team size'],
      min: [1, 'Team size must be at least 1'],
      max: [10, 'Team size cannot exceed 10'],
      default: 4
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Completed', 'On Hold'],
      default: 'Planning'
    },
    visibility: {
      type: String,
      enum: ['Public', 'Private'],
      default: 'Public'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [memberSchema],
    repoUrl: {
      type: String,
      default: ''
    },
    liveDemoUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

projectSchema.virtual('teamCount').get(function () {
  return (this.members ? this.members.length : 0) + 1;
});

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });
projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });

const MongooseModel = mongoose.models.Project || mongoose.model('Project', projectSchema);
const localMock = createModelMock('projects');

const ModelProxy = new Proxy(MongooseModel, {
  get(target, prop, receiver) {
    if (getIsConnected()) {
      return Reflect.get(target, prop, receiver);
    }
    if (prop in localMock) {
      return localMock[prop];
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = ModelProxy;
