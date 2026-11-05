const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');
const { createModelMock } = require('../config/localStore');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: [
        'join_request',
        'request_accepted',
        'request_rejected',
        'new_member',
        'task_assigned',
        'task_status_changed',
        'new_comment',
        'general'
      ],
      default: 'general'
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: ''
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const MongooseModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const localMock = createModelMock('notifications');

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
