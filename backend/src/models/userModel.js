const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  name: { 
    type: String, 
    trim: true,
    maxlength: 100
  },
  jobTitle: { 
    type: String, 
    trim: true,
    maxlength: 100
  },
  company: { 
    type: String, 
    trim: true,
    maxlength: 100
  },
  phone: { 
    type: String, 
    trim: true
  },
  location: { 
    type: String, 
    trim: true
  },
  website: { 
    type: String, 
    trim: true
  },
  bio: { 
    type: String, 
    maxlength: 500
  },
  avatar: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLoginAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: { updatedAt: 'updatedAt' } });

// Index for search functionality
userSchema.index({ username: 'text', email: 'text', name: 'text' });

module.exports = mongoose.model('User', userSchema);
