const admin = require('firebase-admin');

// Initialize Firebase Admin with service account 
// In production, use environment variables or secure vault for these credentials
// For development, you can use a service account file
try {
  let serviceAccount;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Parse the JSON from environment variable (used in production)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Load from file (used in development)
    try {
      serviceAccount = require('./serviceAccountKey.json');
    } catch (err) {
      console.warn('Service account key file not found, using application default credentials');
    }
  }

  // Initialize the app
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Use application default credentials if no service account is provided
    admin.initializeApp();
  }

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

module.exports = admin; 