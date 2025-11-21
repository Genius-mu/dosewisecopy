const express = require('express');
const { checkInteractions } = require('../controllers/drugController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Both patients and clinics can check drug interactions
router.post('/interactions', protect, checkInteractions);

module.exports = router;

