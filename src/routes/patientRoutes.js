const express = require('express');
const {
  getMe,
  getRecords,
  uploadRecord,
  logSymptom,
  getSymptoms,
} = require('../controllers/patientController');
const { protect, patientOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication and patient role
router.use(protect);
router.use(patientOnly);

router.get('/me', getMe);
router.get('/records', getRecords);
router.post('/upload-record', uploadRecord);
router.post('/symptom', logSymptom);
router.get('/symptoms', getSymptoms);

module.exports = router;

