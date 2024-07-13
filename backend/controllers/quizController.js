// backend/controllers/quizController.js
const Quiz = require('../models/Quiz');

exports.getQuizzes = async (req, res) => {
    try {
      const quizzes = await Quiz.find().populate('course lesson');
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.getQuizById = async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id).populate('course lesson');
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.createQuiz = async (req, res) => {
    const { questions, course, lesson } = req.body;
    try {
      const quiz = new Quiz({ questions, course, lesson });
      await quiz.save();
      res.status(201).json(quiz);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.updateQuiz = async (req, res) => {
    const { id } = req.params;
    const { questions, course, lesson } = req.body;
    try {
      const quiz = await Quiz.findByIdAndUpdate(
        id,
        { questions, course, lesson },
        { new: true }
      );
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.deleteQuiz = async (req, res) => {
    const { id } = req.params;
    try {
      await Quiz.findByIdAndDelete(id);
      res.json({ message: 'Quiz deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
