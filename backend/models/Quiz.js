const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }
  }],
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  subModule: { type: mongoose.Schema.Types.ObjectId, ref: 'SubModule' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

quizSchema.pre('save', function(next) {
  if (this.isNew && !this.order) {
    if (this.subModule) {
      this.constructor.countDocuments({ subModule: this.subModule }).then(count => {
        this.order = count;
        next();
      }).catch(err => next(err));
    } else if (this.module) {
      this.constructor.countDocuments({ module: this.module }).then(count => {
        this.order = count;
        next();
      }).catch(err => next(err));
    } else {
      next();
    }
  } else {
    this.updatedAt = Date.now();
    next();
  }
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;