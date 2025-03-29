const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscribed: { type: Boolean, default: false },
  bio: { type: String, default: '' },
  interests: [{ type: String }],
  enrolledCourses: [{ 
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    progress: { type: Number, default: 0 },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    quizResults: [{
      quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
      score: { type: Number, required: true },
      total: { type: Number, required: true },
      answers: { type: Map, of: String },
      bestScore: { type: Number, default: 0 },
      attempts: { type: Number, default: 1 },
      completedAt: { type: Date, default: Date.now }
    }],
    startedLessons: [{ 
      lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
      startedAt: { type: Date, default: Date.now },
      lastAccessed: { type: Date, default: Date.now },
      timeSpent: { type: Number, default: 0 } // in seconds
    }],
    lastAccessed: { type: Date, default: Date.now },
    dateEnrolled: { type: Date, default: Date.now }
  }],
  activityLog: [{
    type: { type: String, enum: ['login', 'enrollment', 'lesson_completion', 'quiz_completion', 'course_completion'] },
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed }
  }],
  lastActive: { type: Date, default: Date.now },
  streak: { type: Number, default: 0 },
  lastStreakDate: { type: Date },
  totalTimeSpent: { type: Number, default: 0 }, // in seconds
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.updatedAt = Date.now();
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;