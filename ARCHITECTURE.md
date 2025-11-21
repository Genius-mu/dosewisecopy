# 🏗️ Dosewise Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                        │
│                    React / Vue / Mobile App                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    DOSEWISE BACKEND (Node.js)                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API Routes Layer                      │   │
│  │  /api/auth  /api/patient  /api/clinic  /api/access      │   │
│  │  /api/ai    /api/drugs    /api/health                   │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │                 Controllers Layer                        │   │
│  │  authController  patientController  clinicController     │   │
│  │  accessController  aiController  drugController          │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │                 Middleware Layer                         │   │
│  │  authMiddleware (JWT)  errorHandler  CORS                │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │                 Services Layer                           │   │
│  │  dorraService (Dorra API)  qrService (QR Codes)         │   │
│  └─────────────┬────────────────────────┬──────────────────┘   │
│                │                        │                        │
│  ┌─────────────▼────────────┐  ┌───────▼──────────────────┐   │
│  │     Models Layer         │  │   External Services      │   │
│  │  PatientUser             │  │   Dorra EMR API          │   │
│  │  ClinicUser              │  │   (Auto-sync)            │   │
│  │  AccessGrant             │  └──────────────────────────┘   │
│  │  Encounter               │                                   │
│  │  SymptomLog              │                                   │
│  └─────────────┬────────────┘                                   │
│                │                                                 │
└────────────────┼─────────────────────────────────────────────────┘
                 │
                 │ Mongoose ODM
                 │
┌────────────────▼─────────────────────────────────────────────────┐
│                      MongoDB Database                             │
│  Collections: patientusers, clinicusers, accessgrants,           │
│               encounters, symptomlogs                             │
└───────────────────────────────────────────────────────────────────┘
```

---

## Patient Registration Flow with Dorra Sync

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ POST /api/auth/patient/register
     │ { name, email, password, dob, gender, phone, address, allergies }
     │
┌────▼──────────────────────────────────────────────────────────┐
│  authController.registerPatient()                             │
│                                                                │
│  1. Validate input (name, email, password, dob required)      │
│  2. Check if user exists                                      │
│  3. Create patient in MongoDB                                 │
│     ├─ Hash password with bcrypt                              │
│     └─ Save to PatientUser collection                         │
│                                                                │
│  4. Sync with Dorra EMR ──────────────────────┐               │
│     ├─ Map data to Dorra schema               │               │
│     ├─ Call dorraService.createPatient()      │               │
│     └─ Save dorraPatientId if successful      │               │
│                                                │               │
│  5. Generate JWT token                         │               │
│  6. Return response with dorraPatientId        │               │
└────┬───────────────────────────────────────────┼───────────────┘
     │                                            │
     │                                            │
     │                                   ┌────────▼────────────┐
     │                                   │  dorraService.js    │
     │                                   │                     │
     │                                   │  1. Map data:       │
     │                                   │     name → first_   │
     │                                   │            last_    │
     │                                   │  2. POST to Dorra   │
     │                                   │     /v1/patients/   │
     │                                   │     create          │
     │                                   │  3. Return ID       │
     │                                   └────────┬────────────┘
     │                                            │
     │                                            │
     │                                   ┌────────▼────────────┐
     │                                   │  Dorra EMR API      │
     │                                   │  Creates patient    │
     │                                   │  Returns ID: 67     │
     │                                   └─────────────────────┘
     │
     │ Response:
     │ {
     │   "success": true,
     │   "data": {
     │     "_id": "mongodb_id",
     │     "dorraPatientId": "67",  ← Synced!
     │     "token": "jwt_token"
     │   },
     │   "message": "Patient registered and synced with Dorra EMR"
     │ }
     │
┌────▼─────┐
│  Client  │
└──────────┘
```

---

## Data Flow: Get Patient Records

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ GET /api/patient/records
     │ Authorization: Bearer <token>
     │
┌────▼──────────────────────────────────────────────────────────┐
│  authMiddleware.protect()                                     │
│  1. Verify JWT token                                          │
│  2. Decode user ID and type                                   │
│  3. Fetch user from database                                  │
│  4. Attach to req.user                                        │
└────┬──────────────────────────────────────────────────────────┘
     │
┌────▼──────────────────────────────────────────────────────────┐
│  patientController.getRecords()                               │
│                                                                │
│  1. Check if patient has dorraPatientId                       │
│     │                                                          │
│     ├─ YES: Fetch from Dorra EMR ──────────┐                 │
│     │   ├─ Get patient data                │                 │
│     │   └─ Get encounters                  │                 │
│     │                                       │                 │
│     └─ NO: Skip Dorra fetch                │                 │
│                                             │                 │
│  2. Fetch local encounters from MongoDB    │                 │
│                                             │                 │
│  3. Merge Dorra + Local data                │                 │
│                                             │                 │
│  4. Return combined response                │                 │
└────┬────────────────────────────────────────┼─────────────────┘
     │                                         │
     │                                ┌────────▼────────────┐
     │                                │  dorraService.js    │
     │                                │                     │
     │                                │  GET /v1/patients/  │
     │                                │      {id}           │
     │                                │  GET /v1/patients/  │
     │                                │      {id}/encounters│
     │                                └────────┬────────────┘
     │                                         │
     │                                ┌────────▼────────────┐
     │                                │  Dorra EMR API      │
     │                                │  Returns patient    │
     │                                │  and encounters     │
     │                                └─────────────────────┘
     │
     │ Response:
     │ {
     │   "success": true,
     │   "data": {
     │     "dorraRecords": { ... },  ← From Dorra EMR
     │     "localEncounters": [ ... ] ← From MongoDB
     │   }
     │ }
     │
┌────▼─────┐
│  Client  │
└──────────┘
```

---

## Technology Stack

### Backend Framework
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Mongoose** - MongoDB ODM

### Authentication & Security
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### External Integrations
- **Dorra EMR API** - Healthcare data management
- **axios** - HTTP client for API calls

### Utilities
- **qrcode** - QR code generation
- **uuid** - Unique ID generation
- **dotenv** - Environment configuration

---

## Database Schema

### PatientUser
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  dob: Date,
  gender: String (enum),
  phone: String,
  address: String,
  allergies: [String],
  dorraPatientId: String,  // ← Dorra EMR ID
  userType: 'patient',
  createdAt: Date,
  updatedAt: Date
}
```

### ClinicUser
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  hospital: String,
  userType: 'clinic',
  createdAt: Date,
  updatedAt: Date
}
```

### AccessGrant
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: PatientUser),
  clinicId: ObjectId (ref: ClinicUser),
  code: String (UUID, unique),
  expiresAt: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Encounter
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: PatientUser),
  clinicId: ObjectId (ref: ClinicUser),
  dorraEncounterId: String,  // ← Dorra EMR ID
  summary: String,
  symptoms: [String],
  diagnosis: String,
  medications: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  vitals: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    weight: String,
    height: String
  },
  encounterDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### SymptomLog
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: PatientUser),
  symptom: String,
  severity: String (enum: mild/moderate/severe),
  notes: String,
  loggedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints Summary

### Authentication (3)
- `POST /api/auth/patient/register` - Register patient (auto-syncs with Dorra)
- `POST /api/auth/clinic/register` - Register clinic
- `POST /api/auth/login` - Login (patient or clinic)

### Patient Routes (5)
- `GET /api/patient/me` - Get profile
- `GET /api/patient/records` - Get medical records (Dorra + local)
- `POST /api/patient/upload-record` - Upload EMR (AI extraction)
- `POST /api/patient/symptom` - Log symptom
- `GET /api/patient/symptoms` - Get symptom history

### Clinic Routes (3)
- `GET /api/clinic/patient/:id` - Get patient info
- `POST /api/clinic/encounter` - Create encounter
- `POST /api/clinic/prescription/check` - Check drug interactions

### Access Control (3)
- `POST /api/access/generate-qr` - Generate QR code
- `GET /api/access/scan/:code` - Scan QR code
- `DELETE /api/access/revoke/:grantId` - Revoke access

### AI Routes (2)
- `POST /api/ai/emr` - AI EMR extraction
- `POST /api/ai/patient` - AI patient creation

### Drug Routes (1)
- `POST /api/drugs/interactions` - Check drug interactions

### Health (2)
- `GET /` - API status
- `GET /api/health` - Health check

---

## Security Features

1. **Password Hashing** - bcrypt with 10 salt rounds
2. **JWT Authentication** - 30-day token expiry
3. **Role-Based Access** - Patient/Clinic separation
4. **Protected Routes** - Middleware verification
5. **CORS** - Configured for cross-origin requests
6. **Environment Variables** - Sensitive data protection

---

## Error Handling

```javascript
// Centralized error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});
```

---

**Architecture Complete! 🏗️**

