# 🏥 Dosewise Backend

Production-ready backend for Dosewise health application with full **Dorra EMR API** integration.

## 🚀 Features

- ✅ **Patient & Clinic Management** - Separate user types with role-based access
- ✅ **Dorra EMR Integration** - Full integration with Dorra EMR API
- ✅ **AI-Powered EMR Extraction** - Extract structured data from unstructured medical records
- ✅ **Drug Interaction Checking** - PharmaVigilance API integration
- ✅ **QR-Based Access Control** - Secure patient data sharing with clinics
- ✅ **Symptom Logging** - Patient self-reporting
- ✅ **Encounter Management** - Create and manage medical encounters
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **MongoDB Database** - Scalable NoSQL database

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Dorra API Key

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd dosewise
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/dosewise
JWT_SECRET=your_jwt_secret_key_here_change_in_production
DORRA_API_KEY=your_dorra_api_key_here
DORRA_API_BASE_URL=https://hackathon-api.aheadafrica.org/api
NODE_ENV=development
```

4. **Start MongoDB**

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

5. **Run the server**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:4000`

## 📁 Project Structure

```
dosewise/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── constants.js         # App constants
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── patientController.js # Patient operations
│   │   ├── clinicController.js  # Clinic operations
│   │   ├── accessController.js  # QR access control
│   │   ├── aiController.js      # AI operations
│   │   └── drugController.js    # Drug interactions
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── PatientUser.js       # Patient schema
│   │   ├── ClinicUser.js        # Clinic schema
│   │   ├── AccessGrant.js       # QR access schema
│   │   ├── Encounter.js         # Medical encounter schema
│   │   └── SymptomLog.js        # Symptom log schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── patientRoutes.js     # Patient endpoints
│   │   ├── clinicRoutes.js      # Clinic endpoints
│   │   ├── accessRoutes.js      # Access control endpoints
│   │   ├── aiRoutes.js          # AI endpoints
│   │   └── drugRoutes.js        # Drug endpoints
│   ├── services/
│   │   ├── dorraService.js      # Dorra API integration
│   │   └── qrService.js         # QR code generation
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── .env.example                 # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/patient/register` - Register new patient
- `POST /api/auth/clinic/register` - Register new clinic
- `POST /api/auth/login` - Login (patient or clinic)

### Patient Routes (Protected)

- `GET /api/patient/me` - Get current patient profile
- `GET /api/patient/records` - Get medical records from Dorra EMR
- `POST /api/patient/upload-record` - Upload & extract medical record using AI
- `POST /api/patient/symptom` - Log a symptom
- `GET /api/patient/symptoms` - Get symptom history

### Clinic Routes (Protected)

- `GET /api/clinic/patient/:id` - Get patient information
- `POST /api/clinic/encounter` - Create new medical encounter
- `GET /api/clinic/encounter/:id` - Get encounter by ID (with drug interactions)
- `POST /api/clinic/prescription/check` - Check drug interactions

### Access Control (Protected)

- `POST /api/access/generate-qr` - Generate QR code for patient access (Patient only)
- `GET /api/access/scan/:code` - Scan QR code to access patient data (Clinic only)
- `DELETE /api/access/revoke/:grantId` - Revoke access grant (Patient only)

### AI Routes (Protected)

- `POST /api/ai/emr` - Extract structured data from EMR text
- `POST /api/ai/patient` - Create patient using AI (Clinic only)

### Drug Routes (Protected)

- `POST /api/drugs/interactions` - Check drug interactions

### Health Check

- `GET /` - API status
- `GET /api/health` - Health check

## 📝 API Usage Examples

See [POSTMAN_EXAMPLES.md](POSTMAN_EXAMPLES.md) for detailed request/response examples.

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[DORRA_INTEGRATION_SUCCESS.md](DORRA_INTEGRATION_SUCCESS.md)** - ✅ **INTEGRATION WORKING!** Test results & proof
- **[AI_EMR_FIX_SUMMARY.md](AI_EMR_FIX_SUMMARY.md)** - 🤖 **AI EMR Extraction Fixed!** How it works & test results
- **[DORRA_PHARMAVIGILANCE_UPDATE.md](DORRA_PHARMAVIGILANCE_UPDATE.md)** - 🆕 **PharmaVigilance & Enhanced Data** Drug interactions in encounters
- **[CLINIC_PATIENT_RELATIONSHIP.md](CLINIC_PATIENT_RELATIONSHIP.md)** - 🏥 **How clinics access patient records** (QR-based access control)
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and data flow diagrams
- **[DORRA_INTEGRATION.md](DORRA_INTEGRATION.md)** - Complete Dorra EMR API integration guide
- **[POSTMAN_EXAMPLES.md](POSTMAN_EXAMPLES.md)** - Complete API examples with 20 endpoints
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Complete testing workflow
- **[INTEGRATION_UPDATE_SUMMARY.md](INTEGRATION_UPDATE_SUMMARY.md)** - Latest integration updates
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project overview and completion status

---

## 🔧 Development

### Available Scripts

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start
```

### Environment Variables

| Variable             | Description               | Example                                     |
| -------------------- | ------------------------- | ------------------------------------------- |
| `PORT`               | Server port               | `4000`                                      |
| `MONGO_URI`          | MongoDB connection string | `mongodb://localhost:27017/dosewise`        |
| `JWT_SECRET`         | Secret key for JWT tokens | `your_secret_key`                           |
| `DORRA_API_KEY`      | Dorra EMR API key         | `your_api_key`                              |
| `DORRA_API_BASE_URL` | Dorra API base URL        | `https://hackathon-api.aheadafrica.org/api` |
| `NODE_ENV`           | Environment               | `development` or `production`               |

---

## 🔐 Security

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT authentication with 30-day expiry
- ✅ Role-based access control (Patient/Clinic)
- ✅ Protected routes with middleware
- ✅ Environment variable protection
- ✅ CORS enabled

---

## 🌐 Dorra EMR Integration

This backend fully integrates with the Dorra EMR API:

- **AI EMR Extraction** - Extract structured data from unstructured medical records
- **AI Patient Creation** - Create patients using natural language processing
- **Patient Management** - Create, retrieve, and manage patient records
- **Encounter Management** - Create and retrieve medical encounters
- **Drug Interactions** - Check medication interactions via PharmaVigilance API

All Dorra API calls include proper authentication and error handling.

---

## 🧪 Testing the API

### Quick Test with curl

```bash
# Health check
curl http://localhost:4000/api/health

# Register a patient
curl -X POST http://localhost:4000/api/auth/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "dob": "1990-05-15"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "userType": "patient"
  }'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running: `brew services list` (macOS)
- Check `MONGO_URI` in `.env`
- Try `127.0.0.1` instead of `localhost`

### Port Already in Use

- Change `PORT` in `.env`
- Or kill the process: `lsof -ti:4000 | xargs kill -9`

### Dorra API Errors

- Verify `DORRA_API_KEY` is correct
- Check internet connection
- Ensure Dorra API is accessible

See [QUICKSTART.md](QUICKSTART.md) for more troubleshooting tips.

---

## 📦 Dependencies

### Production Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `axios` - HTTP client for Dorra API
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `uuid` - UUID generation
- `qrcode` - QR code generation

### Development Dependencies

- `nodemon` - Auto-reload during development

---

## 🚀 Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB instance (MongoDB Atlas)
- [ ] Enable HTTPS
- [ ] Configure CORS for your frontend domain
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### Deployment Platforms

This backend can be deployed to:

- **Heroku** - Easy deployment with MongoDB Atlas
- **AWS EC2** - Full control with custom configuration
- **DigitalOcean** - Simple droplet deployment
- **Railway** - Modern deployment platform
- **Render** - Free tier available

---

## 📊 Project Stats

- **Total Endpoints:** 19
- **Models:** 5 (PatientUser, ClinicUser, AccessGrant, Encounter, SymptomLog)
- **Controllers:** 6
- **Services:** 2 (Dorra API, QR Code)
- **Middleware:** 2 (Auth, Error Handler)
- **External APIs:** 1 (Dorra EMR with 7 endpoints)

---

## 🤝 Contributing

This is a hackathon project. For production use:

1. Add comprehensive testing (Jest/Mocha)
2. Implement request validation (Joi/express-validator)
3. Add rate limiting
4. Set up structured logging (Winston)
5. Add API documentation (Swagger/OpenAPI)

---

## 📄 License

ISC

---

## 👨‍💻 Author

Built for the Dosewise Health Application

---

**Ready to demo! 🎉**
