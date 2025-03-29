const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get a single lesson
router.get('/:id', lessonController.getLesson);

// Get lessons for a module
router.get('/module/:moduleId', lessonController.getLessonsByModule);

// Add this new route for submodules
router.get('/submodule/:subModuleId', lessonController.getLessonsBySubModule);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, lessonController.createLesson);
router.post('/reorder', authMiddleware, adminMiddleware, lessonController.reorderLessons);
router.put('/:id', authMiddleware, adminMiddleware, lessonController.updateLesson);
router.delete('/:id', authMiddleware, adminMiddleware, lessonController.deleteLesson);

module.exports = router;