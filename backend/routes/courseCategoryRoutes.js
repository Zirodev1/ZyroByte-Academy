const express = require('express');
const router = express.Router();
const courseCategoryController = require('../controllers/courseCategoryController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/with-courses', courseCategoryController.getCategoriesWithCourses);
router.get('/', courseCategoryController.getAllCategories);
router.get('/:id', courseCategoryController.getCategoryById);

// New route for category statistics
router.get('/:id/stats', courseCategoryController.getCategoryStats);

// Admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/', courseCategoryController.createCategory);
router.put('/:id', courseCategoryController.updateCategory);
router.delete('/:id', courseCategoryController.deleteCategory);
router.post('/reorder', courseCategoryController.reorderCategories);

module.exports = router; 