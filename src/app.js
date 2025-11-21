const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const accessRoutes = require('./routes/accessRoutes');
const aiRoutes = require('./routes/aiRoutes');
const drugRoutes = require('./routes/drugRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dosewise API is running',
    version: '1.0.0',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/drugs', drugRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

