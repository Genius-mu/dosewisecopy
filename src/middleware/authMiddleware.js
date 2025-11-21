const jwt = require('jsonwebtoken');
const PatientUser = require('../models/PatientUser');
const ClinicUser = require('../models/ClinicUser');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      if (decoded.userType === 'patient') {
        req.user = await PatientUser.findById(decoded.id).select('-password');
      } else if (decoded.userType === 'clinic') {
        req.user = await ClinicUser.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Middleware to check if user is a patient
const patientOnly = (req, res, next) => {
  if (req.user && req.user.userType === 'patient') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Patients only.' });
  }
};

// Middleware to check if user is a clinic
const clinicOnly = (req, res, next) => {
  if (req.user && req.user.userType === 'clinic') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Clinics only.' });
  }
};

module.exports = { protect, patientOnly, clinicOnly };

