const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    videoUrl: { type: String },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }
  });
  
  const Lesson = mongoose.model('Lesson', lessonSchema);
  module.exports = Lesson;