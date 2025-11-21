require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 4000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏥  DOSEWISE BACKEND SERVER                            ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                           ║
║   API Endpoints:                                          ║
║   - Health Check: http://localhost:${PORT}/api/health        ║
║   - Auth: http://localhost:${PORT}/api/auth                  ║
║   - Patient: http://localhost:${PORT}/api/patient            ║
║   - Clinic: http://localhost:${PORT}/api/clinic              ║
║   - Access: http://localhost:${PORT}/api/access              ║
║   - AI: http://localhost:${PORT}/api/ai                      ║
║   - Drugs: http://localhost:${PORT}/api/drugs                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

