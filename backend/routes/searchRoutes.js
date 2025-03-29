// backend/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Global search across all content types
router.get('/', searchController.searchAll);

// Filtered searches by content type
router.get('/courses', searchController.getCourses);
router.get('/lessons', searchController.getLessons);
router.get('/quizzes', searchController.getQuizzes);

module.exports = router; 