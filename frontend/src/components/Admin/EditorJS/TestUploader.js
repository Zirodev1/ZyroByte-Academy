import React, { useState } from 'react';
import api from '../../../services/api';

const TestUploader = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      // Create a FormData instance
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Uploading file to Firebase:', file.name);
      
      // Upload the file to Firebase via our API
      const response = await api.post('/uploads/firebase', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Upload response:', response.data);
      
      if (response.data && response.data.success) {
        setUploadResult(response.data.data);
      } else {
        setError(response.data?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Firebase Upload Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept="image/*"
          style={{ marginBottom: '10px', display: 'block' }}
        />
        
        <button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: file && !isUploading ? 'pointer' : 'not-allowed'
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload to Firebase'}
        </button>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}
      
      {uploadResult && (
        <div style={{ marginTop: '20px' }}>
          <h2>Upload Successful!</h2>
          <div style={{ marginBottom: '10px' }}>
            <strong>File URL:</strong> <a href={uploadResult.fileUrl} target="_blank" rel="noopener noreferrer">{uploadResult.fileUrl}</a>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>File Name:</strong> {uploadResult.fileName}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>File Type:</strong> {uploadResult.fileType}
          </div>
          <div style={{ marginBottom: '20px' }}>
            <strong>File Size:</strong> {(uploadResult.fileSize / 1024).toFixed(2)} KB
          </div>
          
          <div>
            <h3>Image Preview:</h3>
            <img 
              src={uploadResult.fileUrl} 
              alt="Uploaded file" 
              style={{ maxWidth: '100%', maxHeight: '300px', border: '1px solid #ddd' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestUploader; 