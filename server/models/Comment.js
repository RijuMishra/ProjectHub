const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');
const { createModelMock } = require('../config/localStore');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({ project: 1, createdAt: -1 });

const MongooseModel = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
const localMock = createModelMock('comments');

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
