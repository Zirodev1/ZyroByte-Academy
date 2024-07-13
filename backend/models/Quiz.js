const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  questions: [{
    questionText: { type: String, required: true },
    answerOptions: [{ answerText: String, isCorrect: Boolean }]
  }],
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: false }
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;