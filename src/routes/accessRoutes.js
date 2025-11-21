const express = require('express');
const { generateQR, scanQR, revokeAccess } = require('../controllers/accessController');
const { protect, patientOnly, clinicOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Patient routes
router.post('/generate-qr', protect, patientOnly, generateQR);
router.delete('/revoke/:grantId', protect, patientOnly, revokeAccess);

// Clinic routes
router.get('/scan/:code', protect, clinicOnly, scanQR);

module.exports = router;

