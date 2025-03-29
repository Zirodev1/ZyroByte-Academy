const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get modules for a course
router.get('/course/:courseId', moduleController.getModulesByCourse);

// Get a single module
router.get('/:id', moduleController.getModule);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, moduleController.createModule);
router.post('/reorder', authMiddleware, adminMiddleware, moduleController.reorderModules);
router.put('/:id', authMiddleware, adminMiddleware, moduleController.updateModule);
router.delete('/:id', authMiddleware, adminMiddleware, moduleController.deleteModule);

module.exports = router; 