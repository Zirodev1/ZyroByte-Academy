const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { storage } = require('../config/firebase');
const { ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
const multer = require('multer');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadsDir, 'images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Configure multer for temporary file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow specific file types
    const filetypes = /jpeg|jpg|png|gif|mp3|mp4|webm|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image, audio, video, and PDF files are allowed!'));
  }
});

// Helper to determine content type folder
const getContentTypeFolder = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('video/')) return 'videos';
  if (mimetype === 'application/pdf') return 'documents';
  return 'misc';
};

/**
 * Handle file upload for editor.js image tool
 */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: 0,
        message: 'No file uploaded' 
      });
    }

    // Generate unique filename to prevent overwriting
    const originalName = req.file.originalname;
    const extension = path.extname(originalName);
    const fileName = `${uuidv4()}${extension}`;
    
    // Save file to uploads/images directory
    const filePath = path.join(imagesDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);
    
    // Generate URL for the image
    const imageUrl = `/uploads/images/${fileName}`;
    
    res.json({
      success: 1,
      url: imageUrl
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      success: 0,
      message: 'File upload failed' 
    });
  }
};

/**
 * Handle image upload by URL
 */
exports.uploadByUrl = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: 0,
        message: 'URL is required' 
      });
    }
    
    // For security, you might want to validate the URL further
    // and possibly download and store the image on your server
    
    // For now, we'll just return the URL
    res.json({
      success: 1,
      url: url
    });
  } catch (error) {
    console.error('URL upload error:', error);
    res.status(500).json({ 
      success: 0,
      message: 'URL processing failed' 
    });
  }
};

/**
 * Serve uploaded images
 */
exports.serveImage = (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(imagesDir, fileName);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Image not found' });
  }
  
  // Determine content type based on file extension
  const ext = path.extname(fileName).toLowerCase();
  let contentType = 'image/jpeg';
  
  if (ext === '.png') {
    contentType = 'image/png';
  } else if (ext === '.gif') {
    contentType = 'image/gif';
  } else if (ext === '.webp') {
    contentType = 'image/webp';
  }
  
  // Set content type and serve the file
  res.setHeader('Content-Type', contentType);
  res.sendFile(filePath);
};

// Upload file to Firebase Storage
exports.uploadFile = async (req, res) => {
  try {
    // Single file upload middleware
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const file = req.file;
      const contentType = getContentTypeFolder(file.mimetype);
      const timestamp = Date.now();
      const fileName = `${contentType}/${timestamp}-${file.originalname.replace(/\s/g, '_')}`;
      
      // Create a storage reference
      const storageRef = ref(storage, fileName);
      
      // Create file metadata including the content type
      const metadata = {
        contentType: file.mimetype,
      };
      
      // Upload the file
      const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          fileName,
          fileUrl: downloadURL,
          fileType: file.mimetype,
          fileSize: file.size
        }
      });
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

// Upload multiple files to Firebase Storage
exports.uploadMultipleFiles = async (req, res) => {
  try {
    // Multiple files upload middleware
    upload.array('files', 10)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }
      
      const uploadPromises = req.files.map(async (file) => {
        const contentType = getContentTypeFolder(file.mimetype);
        const timestamp = Date.now();
        const fileName = `${contentType}/${timestamp}-${file.originalname.replace(/\s/g, '_')}`;
        
        // Create a storage reference
        const storageRef = ref(storage, fileName);
        
        // Create file metadata including the content type
        const metadata = {
          contentType: file.mimetype,
        };
        
        // Upload the file
        const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
          fileName,
          fileUrl: downloadURL,
          fileType: file.mimetype,
          fileSize: file.size
        };
      });
      
      const uploadResults = await Promise.all(uploadPromises);
      
      res.status(200).json({
        success: true,
        message: 'Files uploaded successfully',
        data: uploadResults
      });
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
}; 