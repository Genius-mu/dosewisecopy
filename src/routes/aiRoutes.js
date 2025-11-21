const express = require('express');
const { extractEmr, createPatientAI } = require('../controllers/aiController');
const { protect, clinicOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Both patient and clinic can use EMR extraction
router.post('/emr', protect, extractEmr);

// Only clinics can create patients using AI
router.post('/patient', protect, clinicOnly, createPatientAI);

module.exports = router;

