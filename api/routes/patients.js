const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Get all patients
router.get('/', async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { risk, search, limit = 50 } = req.query;
    
    let patientsRef = admin.firestore().collection('patients');
    
    // Apply filters if provided
    if (risk) {
      patientsRef = patientsRef.where('riskLevel', '==', risk);
    }
    
    // Get documents
    const snapshot = await patientsRef.limit(parseInt(limit)).get();
    
    if (snapshot.empty) {
      return res.json({ patients: [] });
    }
    
    let patients = [];
    snapshot.forEach(doc => {
      const patientData = doc.data();
      
      // Apply text search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        const nameMatch = `${patientData.firstName} ${patientData.lastName}`.toLowerCase().includes(searchLower);
        if (!nameMatch) return; // Skip this patient if no match
      }
      
      patients.push({
        id: doc.id,
        ...patientData
      });
    });
    
    res.json({ patients });
  } catch (error) {
    console.error('Error getting patients:', error);
    res.status(500).json({ error: 'Failed to get patients' });
  }
});

// Get a single patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patientId = req.params.id;
    const doc = await admin.firestore().collection('patients').doc(patientId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    console.error('Error getting patient:', error);
    res.status(500).json({ error: 'Failed to get patient' });
  }
});

// Create a new patient
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      phone,
      address,
      pregnancyStage,
      edd,
      medicalHistory,
      bloodType,
      assignedDoctor,
      assignedMidwife,
      riskLevel
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const patientData = {
      firstName,
      lastName,
      dateOfBirth,
      phone,
      address,
      pregnancyStage: pregnancyStage || '',
      edd: edd || '',
      medicalHistory: medicalHistory || '',
      bloodType: bloodType || '',
      lastVisit: '',
      nextVisit: '',
      assignedDoctor: assignedDoctor || '',
      assignedMidwife: assignedMidwife || '',
      riskLevel: riskLevel || 'low',
      notes: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await admin.firestore().collection('patients').add(patientData);
    
    res.status(201).json({
      id: docRef.id,
      ...patientData
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// Update a patient
router.put('/:id', async (req, res) => {
  try {
    const patientId = req.params.id;
    const updateData = req.body;
    
    // Remove any fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;
    
    // Add updatedAt timestamp
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    // Update the document
    await admin.firestore().collection('patients').doc(patientId).update(updateData);
    
    // Get the updated document
    const updatedDoc = await admin.firestore().collection('patients').doc(patientId).get();
    
    if (!updatedDoc.exists) {
      return res.status(404).json({ error: 'Patient not found after update' });
    }
    
    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// Delete a patient
router.delete('/:id', async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Check if patient exists
    const doc = await admin.firestore().collection('patients').doc(patientId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Delete the patient
    await admin.firestore().collection('patients').doc(patientId).delete();
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// Get high-risk patients
router.get('/risk/high', async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection('patients')
      .where('riskLevel', '==', 'high')
      .get();
    
    let patients = [];
    snapshot.forEach(doc => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ patients });
  } catch (error) {
    console.error('Error getting high-risk patients:', error);
    res.status(500).json({ error: 'Failed to get high-risk patients' });
  }
});

// Get patients with upcoming appointments
router.get('/appointments/upcoming', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // Calculate date range
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + parseInt(days));
    
    // Format as YYYY-MM-DD for Firestore comparison
    const todayStr = now.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    const snapshot = await admin.firestore()
      .collection('patients')
      .where('nextVisit', '>=', todayStr)
      .where('nextVisit', '<=', futureDateStr)
      .orderBy('nextVisit')
      .get();
    
    let patients = [];
    snapshot.forEach(doc => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ patients });
  } catch (error) {
    console.error('Error getting patients with upcoming appointments:', error);
    res.status(500).json({ error: 'Failed to get upcoming appointments' });
  }
});

module.exports = router; 