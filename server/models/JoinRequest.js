const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');
const { createModelMock } = require('../config/localStore');

const joinRequestSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      default: '',
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    proposedRole: {
      type: String,
      default: 'Collaborator',
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

joinRequestSchema.index({ project: 1, applicant: 1, status: 1 });

const MongooseModel = mongoose.models.JoinRequest || mongoose.model('JoinRequest', joinRequestSchema);
const localMock = createModelMock('joinRequests');

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
