const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');
require('dotenv').config();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase
try {
  console.log('Initializing Firebase app...');
  const firebaseApp = initializeApp(firebaseConfig);
  console.log('Firebase app initialized');
  
  console.log('Initializing Firebase storage...');
  const storage = getStorage(firebaseApp);
  console.log('Firebase storage initialized successfully');
  
  module.exports = { storage };
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Provide a mock storage implementation for fallback
  const mockStorage = {
    mock: true,
    error: error.message
  };
  module.exports = { storage: mockStorage };
} 