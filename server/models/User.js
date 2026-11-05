const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getIsConnected } = require('../config/db');
const { createModelMock } = require('../config/localStore');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
      trim: true
    },
    year: {
      type: String,
      default: '3rd Year',
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Faculty / Mentor']
    },
    skills: {
      type: [String],
      default: []
    },
    bio: {
      type: String,
      default: '',
      maxlength: [300, 'Bio cannot exceed 300 characters']
    },
    github: {
      type: String,
      default: ''
    },
    linkedin: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseModel = mongoose.models.User || mongoose.model('User', userSchema);
const localMock = createModelMock('users');

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
