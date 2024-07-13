const mongoose = require('mongoose');

const lessonsSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: { type: String, required: true },
});

const quizzesSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: { type: String, required: true },
    correctAnswer: { type: String, required: true },
});

const courseSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: { type: String, required: true },
    featured: { type: Boolean, default: false },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'}],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz'}],
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;