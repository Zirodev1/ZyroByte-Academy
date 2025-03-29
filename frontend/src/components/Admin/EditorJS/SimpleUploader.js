import React, { useState } from 'react';
import api from '../../../services/api';

const SimpleUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [error, setError] = useState(null);
  const [testResponse, setTestResponse] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError(null);
    setUploadResponse(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/uploads/firebase', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadResponse(response.data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const testFirebaseConnection = async () => {
    setTestLoading(true);
    setTestError(null);
    setTestResponse(null);

    try {
      const response = await api.get('/uploads/firebase-test');
      setTestResponse(response.data);
    } catch (err) {
      console.error('Test connection error:', err);
      setTestError(err.response?.data?.message || err.message || 'Firebase test failed');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Simple Firebase Uploader</h1>
      
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>Test Firebase Connection</h2>
        <button 
          onClick={testFirebaseConnection}
          disabled={testLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: testLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {testLoading ? 'Testing...' : 'Test Firebase Connection'}
        </button>
        
        {testError && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            <h4>Error:</h4>
            <pre style={{ background: '#f8f8f8', padding: '10px', overflow: 'auto' }}>
              {typeof testError === 'string' ? testError : JSON.stringify(testError, null, 2)}
            </pre>
          </div>
        )}
        
        {testResponse && (
          <div style={{ marginTop: '10px' }}>
            <h4>Test Results:</h4>
            <pre style={{ background: '#f8f8f8', padding: '10px', overflow: 'auto' }}>
              {JSON.stringify(testResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Upload Image</h2>
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept="image/*"
          style={{ marginBottom: '10px', display: 'block' }}
        />
        
        <button 
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (selectedFile && !loading) ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <h3>Error:</h3>
          <pre style={{ background: '#f8f8f8', padding: '10px', overflow: 'auto' }}>
            {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      {uploadResponse && (
        <div>
          <h3>Upload Response:</h3>
          <pre style={{ background: '#f8f8f8', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(uploadResponse, null, 2)}
          </pre>
          
          {uploadResponse.success && uploadResponse.data && uploadResponse.data.fileUrl && (
            <div style={{ marginTop: '20px' }}>
              <h3>Uploaded Image:</h3>
              <img 
                src={uploadResponse.data.fileUrl} 
                alt="Uploaded" 
                style={{ maxWidth: '100%', maxHeight: '400px', border: '1px solid #ddd' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleUploader; 