// backend/controllers/lessonController.js
const Lesson = require("../models/Lesson");

exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().populate('course quiz');
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course quiz');
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.completeLesson = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user.progress[req.params.courseId]) {
        user.progress[req.params.courseId] = { courseId: req.params.courseId, completedLessons: [] };
      }
      user.progress[req.params.courseId].completedLessons.push(req.params.lessonId);
      await user.save();
      res.status(200).send('Lesson completed');
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  

  exports.createLesson = async (req, res) => {
    try {
      const lesson = new Lesson(req.body);
      await lesson.save();
      res.status(201).json(lesson);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  exports.updateLesson = async (req, res) => {
    try {
      const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(lesson);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  exports.deleteLesson = async (req, res) => {
    try {
      await Lesson.findByIdAndDelete(req.params.id);
      res.json({ message: 'Lesson deleted' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
