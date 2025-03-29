// backend/routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/', quizController.getQuizzes);

// Routes that should behave differently for authenticated users
router.get('/:id', authMiddleware, quizController.getQuiz);
router.get('/course/:courseId', authMiddleware, quizController.getQuizzesByCourse);

// Protected routes
router.post('/', authMiddleware, quizController.createQuiz);
router.put('/:id', authMiddleware, quizController.updateQuiz);
router.delete('/:id', authMiddleware, quizController.deleteQuiz);

// User quiz results
router.get('/results/:quizId', authMiddleware, quizController.getUserQuizResults);

// Get quizzes for a module
router.get('/module/:moduleId', quizController.getQuizzesByModule);

// Add this new route for submodules
router.get('/submodule/:subModuleId', quizController.getQuizzesBySubModule);

// Submit a quiz attempt
router.post('/attempt', authMiddleware, quizController.submitQuizAttempt);

// Admin routes
router.post('/reorder', authMiddleware, adminMiddleware, quizController.reorderQuizzes);

module.exports = router;