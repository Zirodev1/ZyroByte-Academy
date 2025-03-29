const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Image upload endpoint for Editor.js
router.post('/images', authMiddleware, adminMiddleware, upload.single('image'), uploadController.uploadImage);

// URL upload endpoint for Editor.js
router.post('/url', authMiddleware, adminMiddleware, uploadController.uploadByUrl);

// Serve uploaded images
router.get('/images/:fileName', uploadController.serveImage);

// Local file upload routes
router.post('/image', authMiddleware, adminMiddleware, uploadController.uploadImage);

// Firebase storage upload routes
router.post('/firebase', authMiddleware, adminMiddleware, uploadController.uploadFile);
router.post('/firebase/multiple', authMiddleware, adminMiddleware, uploadController.uploadMultipleFiles);


module.exports = router; 