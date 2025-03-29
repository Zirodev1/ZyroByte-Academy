const mongoose = require('mongoose');

const enrollmentAnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  referralSource: {
    type: String,
    enum: ['direct', 'search', 'email', 'social', 'recommendation', 'advertisement', 'other'],
    default: 'direct'
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  userAgent: {
    type: String
  },
  ipAddress: {
    type: String
  },
  completionStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'dropped'],
    default: 'not_started'
  },
  firstAccessTimestamp: {
    type: Date
  },
  lastAccessTimestamp: {
    type: Date
  },
  totalTimeSpent: {
    type: Number,
    default: 0  // in minutes
  },
  engagementScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, { timestamps: true });

// Add indexes for frequently queried fields
enrollmentAnalyticsSchema.index({ course: 1 });
enrollmentAnalyticsSchema.index({ user: 1 });
enrollmentAnalyticsSchema.index({ enrollmentDate: 1 });
enrollmentAnalyticsSchema.index({ referralSource: 1 });
enrollmentAnalyticsSchema.index({ completionStatus: 1 });

const EnrollmentAnalytics = mongoose.model('EnrollmentAnalytics', enrollmentAnalyticsSchema);

module.exports = EnrollmentAnalytics; 