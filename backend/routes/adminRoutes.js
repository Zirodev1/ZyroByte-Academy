const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const lessonController = require('../controllers/lessonController');
const quizController = require('../controllers/quizController');
const admin = require('../middleware/adminMiddleware');

router.post('/courses', admin, courseController.createCourse);
router.put('/courses/:id', admin, courseController.updateCourse);
router.delete('/courses/:id', admin, courseController.deleteCourse);

router.post('/lessons', admin, lessonController.createLesson);
router.put('/lessons/:id', admin, lessonController.updateLesson);
router.delete('/lessons/:id', admin, lessonController.deleteLesson);

router.post('/quizzes', admin, quizController.createQuiz);
router.put('/quizzes/:id', admin, quizController.updateQuiz);
router.delete('/quizzes/:id', admin, quizController.deleteQuiz);

module.exports = router;