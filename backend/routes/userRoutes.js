const express = require('express')
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')

// Auth routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Profile routes
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);

// Course enrollment and progress routes
router.post('/enroll', authMiddleware, userController.enrollCourse);
router.post('/update-progress', authMiddleware, userController.updateLessonProgress);
router.post('/submit-quiz', authMiddleware, userController.submitQuizResults);

// Stats and progress tracking routes
router.get('/stats', authMiddleware, userController.getUserStats);
router.get('/progress/:courseId', authMiddleware, userController.getCourseProgress);

// Test endpoints
router.get('/test', (req, res) => {
  res.json({ message: 'User API is working' });
});

// Admin user management routes
router.get('/', adminMiddleware, userController.getAllUsers);

module.exports = router;