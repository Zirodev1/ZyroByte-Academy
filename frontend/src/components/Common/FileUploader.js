import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './FileUploader.css';

const FileUploader = ({ onFileUploaded, allowedTypes = "image/*,audio/*,video/*,.pdf", maxSize = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    await uploadFile(file);
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };
  
  const uploadFile = async (file) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${maxSize}MB.`);
      return;
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to Firebase Storage
      const response = await api.post('/uploads/firebase', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      
      if (response.data.success) {
        toast.success('File uploaded successfully');
        onFileUploaded(response.data.data.fileUrl, response.data.data.fileType);
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div 
      className={`file-uploader ${dragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="uploader-content">
        <input
          type="file"
          id="file-upload"
          className="file-input"
          onChange={handleFileChange}
          accept={allowedTypes}
          disabled={uploading}
        />
        <label htmlFor="file-upload" className="upload-label">
          {uploading ? (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span>{progress}% Uploaded</span>
            </div>
          ) : (
            <>
              <div className="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <span>Click to upload or drag and drop</span>
              <span className="file-types">Allowed: images, audio, video, PDF (max {maxSize}MB)</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
};

export default FileUploader; 