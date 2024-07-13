const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', lessonController.getLessons);
router.get('/:id', lessonController.getLessonById);
router.post('/', protect, lessonController.createLesson);
router.put('/:id', protect, lessonController.updateLesson);
router.delete('/:id', protect, lessonController.deleteLesson);

module.exports = router;