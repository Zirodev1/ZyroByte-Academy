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
    const { title, content, videoUrl, course, quiz } = req.body;
    try {
      const lesson = new Lesson({ title, content, videoUrl, course, quiz });
      await lesson.save();
      res.status(201).json(lesson);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };  

  exports.updateLesson = async (req, res) => {
    const { id } = req.params;
    const { title, content, videoUrl, course, quiz } = req.body;
    try {
      const lesson = await Lesson.findByIdAndUpdate(
        id,
        { title, content, videoUrl, course, quiz },
        { new: true }
      );
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.deleteLesson = async (req, res) => {
    const { id } = req.params;
    try {
      await Lesson.findByIdAndDelete(id);
      res.json({ message: 'Lesson deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
