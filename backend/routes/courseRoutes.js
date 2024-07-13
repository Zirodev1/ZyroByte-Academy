// backend/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const checkSubscription = require('../middleware/checkSubscription');

router.get('/featured', courseController.getFeaturedCourses);
router.get('/', courseController.getAllCourses);
router.get('/:id',protect, checkSubscription, courseController.getCourseById);
router.post('/:id/enroll', protect, courseController.enrollCourse);

module.exports = router;
