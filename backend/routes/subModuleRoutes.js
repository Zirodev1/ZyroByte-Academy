const express = require('express');
const router = express.Router();
const subModuleController = require('../controllers/subModuleController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get submodules for a module
router.get('/module/:moduleId', subModuleController.getSubModulesByModule);

// Get a single submodule
router.get('/:id', subModuleController.getSubModule);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, subModuleController.createSubModule);
router.post('/reorder', authMiddleware, adminMiddleware, subModuleController.reorderSubModules);
router.put('/:id', authMiddleware, adminMiddleware, subModuleController.updateSubModule);
router.delete('/:id', authMiddleware, adminMiddleware, subModuleController.deleteSubModule);

module.exports = router; 