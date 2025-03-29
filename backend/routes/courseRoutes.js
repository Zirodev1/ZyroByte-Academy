// backend/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const checkSubscription = require('../middleware/checkSubscription');

// Public routes
router.get('/featured', courseController.getFeaturedCourses);
router.get('/', courseController.getAllCourses);

// User routes
router.post('/enroll', authMiddleware, checkSubscription, courseController.enrollCourse);

// Admin routes
router.post('/reorder', authMiddleware, adminMiddleware, courseController.reorderCourses);
router.post('/', authMiddleware, adminMiddleware, courseController.createCourse);
router.get('/:id', courseController.getCourse);
router.put('/:id', authMiddleware, adminMiddleware, courseController.updateCourse);
router.delete('/:id', authMiddleware, adminMiddleware, courseController.deleteCourse);

// Add this route for course statistics
router.get('/:id/stats', courseController.getCourseStats);

module.exports = router;
