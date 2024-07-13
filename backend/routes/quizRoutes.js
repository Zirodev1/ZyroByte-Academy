// backend/routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', quizController.getQuizzes);
router.get('/:id', quizController.getQuizById);
router.post('/', protect, quizController.createQuiz);
router.put('/:id', protect, quizController.updateQuiz);
router.delete('/:id', protect, quizController.deleteQuiz);

module.exports = router;