const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKrFlLgBb1xyAoT0JnqMXrttWkGiwa1fg",
  authDomain: "zyrobyte-academy.firebaseapp.com",
  projectId: "zyrobyte-academy",
  storageBucket: "zyrobyte-academy.firebasestorage.app",
  messagingSenderId: "736049774496",
  appId: "1:736049774496:web:756835cfc3190e6cbf6ec5",
  measurementId: "G-TEJ6TT5Y8G"
};

console.log('Firebase config loaded with storage bucket:', firebaseConfig.storageBucket);

// Initialize Firebase
try {
  console.log('Initializing Firebase app...');
  const firebaseApp = initializeApp(firebaseConfig);
  console.log('Firebase app initialized');
  
  console.log('Initializing Firebase storage...');
  const storage = getStorage(firebaseApp);
  console.log('Firebase storage initialized successfully with bucket:', storage.app.options.storageBucket);
  
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