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
    try {
      const quiz = new Quiz(req.body);
      await quiz.save();
      res.status(201).json(quiz);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  exports.updateQuiz = async (req, res) => {
    try {
      const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(quiz);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  exports.deleteQuiz = async (req, res) => {
    try {
      await Quiz.findByIdAndDelete(req.params.id);
      res.json({ message: 'Quiz deleted' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };