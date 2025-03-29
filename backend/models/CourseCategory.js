const mongoose = require('mongoose');

const courseCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  featuredOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

courseCategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const CourseCategory = mongoose.model('CourseCategory', courseCategorySchema);

module.exports = CourseCategory; 