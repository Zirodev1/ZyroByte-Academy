const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const lessonController = require('../controllers/lessonController');
const quizController = require('../controllers/quizController');
const userController = require('../controllers/userController');
const { adminMiddleware } = require('../middleware/authMiddleware');

// User management endpoints
router.get('/users', adminMiddleware, userController.getAllUsers);

router.post('/courses', adminMiddleware, courseController.createCourse);
router.put('/courses/:id', adminMiddleware, courseController.updateCourse);
router.delete('/courses/:id', adminMiddleware, courseController.deleteCourse);

router.post('/lessons', adminMiddleware, lessonController.createLesson);
router.put('/lessons/:id', adminMiddleware, lessonController.updateLesson);
router.delete('/lessons/:id', adminMiddleware, lessonController.deleteLesson);

router.post('/quizzes', adminMiddleware, quizController.createQuiz);
router.put('/quizzes/:id', adminMiddleware, quizController.updateQuiz);
router.delete('/quizzes/:id', adminMiddleware, quizController.deleteQuiz);

module.exports = router;