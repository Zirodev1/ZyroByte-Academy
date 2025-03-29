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
    imageUrl: { type: String },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    category: { type: String },
    categoryRef: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'CourseCategory'
    },
    order: { 
        type: Number, 
        default: 0 
    },
    duration: { type: String },
    prerequisites: { type: String },
    enrollmentCount: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'}],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz'}],
});

courseSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;