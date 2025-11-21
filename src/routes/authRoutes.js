const express = require('express');
const { registerPatient, registerClinic, login } = require('../controllers/authController');

const router = express.Router();

router.post('/patient/register', registerPatient);
router.post('/clinic/register', registerClinic);
router.post('/login', login);

module.exports = router;

