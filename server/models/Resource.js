const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');
const { createModelMock } = require('../config/localStore');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a resource category'],
      enum: [
        'Notes',
        'Research Paper',
        'Code Repository',
        'Project Report',
        'Presentation',
        'Dataset',
        'Cheatsheet',
        'Other'
      ],
      default: 'Notes'
    },
    tags: {
      type: [String],
      default: []
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL or path is required']
    },
    fileName: {
      type: String,
      required: [true, 'File name is required']
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      default: 0
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    downloadsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

const MongooseModel = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
const localMock = createModelMock('resources');

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
