# 📮 Postman API Examples

Complete request/response examples for all Dosewise API endpoints.

## Base URL

```
http://localhost:4000
```

## 🎉 Dorra EMR Integration Status

✅ **FULLY WORKING!** All patient registrations are automatically synced to Dorra EMR.

- **Dorra API Base URL:** `https://hackathon-api.aheadafrica.org`
- **Authentication:** Token-based (`Authorization: Token <API_KEY>`)
- **Auto-Sync:** Patient registration automatically creates records in Dorra EMR
- **Patient ID:** Each synced patient receives a `dorraPatientId` (e.g., "179", "181")
- **🤖 AI EMR:** AI-powered medical record extraction with automatic pharmacy price lookup

### 🆕 AI Features

✅ **AI EMR Extraction** - Upload medical text and Dorra AI will:

- Analyze the text and determine if it's an Encounter or Appointment
- Extract structured data (diagnosis, medications, vitals, etc.)
- **Actually create** the resource in Dorra EMR
- Find available pharmacies with medication prices
- Return the cheapest pharmacy options

See **[AI_EMR_FIX_SUMMARY.md](AI_EMR_FIX_SUMMARY.md)** for AI EMR details and test results.
See **[DORRA_INTEGRATION_SUCCESS.md](DORRA_INTEGRATION_SUCCESS.md)** for integration test results.

---

## 🔐 Authentication

### 1. Register Patient

**Endpoint:** `POST /api/auth/patient/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "dob": "1990-05-15",
  "gender": "Male",
  "phone": "+1234567890",
  "address": "123 Main Street, New York, NY 10001",
  "allergies": ["Penicillin", "Peanuts"]
}
```

**Response (201) - With Dorra Sync:**

```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "dob": "1990-05-15T00:00:00.000Z",
    "gender": "Male",
    "phone": "+1234567890",
    "address": "123 Main Street, New York, NY 10001",
    "allergies": ["Penicillin", "Peanuts"],
    "dorraPatientId": "179",
    "userType": "patient",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Patient registered and synced with Dorra EMR"
}
```

**Note:**

- ✅ `dorraPatientId` will be present if Dorra EMR sync is successful
- ⚠️ If Dorra sync fails, patient is still created locally with `dorraPatientId: null`
- 📝 Fields `gender`, `phone`, `address`, and `allergies` are optional but recommended

---

### 2. Register Clinic

**Endpoint:** `POST /api/auth/clinic/register`

**Request Body:**

```json
{
  "name": "Dr. Sarah Smith",
  "email": "dr.smith@clinic.com",
  "password": "securepass123",
  "hospital": "City General Hospital"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j1",
    "name": "Dr. Sarah Smith",
    "email": "dr.smith@clinic.com",
    "hospital": "City General Hospital",
    "userType": "clinic",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Login

**Endpoint:** `POST /api/auth/login`

**Request Body (Patient):**

```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "userType": "patient"
}
```

**Request Body (Clinic):**

```json
{
  "email": "dr.smith@clinic.com",
  "password": "securepass123",
  "userType": "clinic"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "userType": "patient",
    "dob": "1990-05-15T00:00:00.000Z",
    "gender": "Male",
    "phone": "+1234567890",
    "address": "123 Main Street, New York, NY 10001",
    "allergies": ["Penicillin", "Peanuts"],
    "dorraPatientId": "179",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 👤 Patient Routes

**Note:** All patient routes require authentication. Add header:

```
Authorization: Bearer <token>
```

### 4. Get Patient Profile

**Endpoint:** `GET /api/patient/me`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "dob": "1990-05-15T00:00:00.000Z",
    "gender": "Male",
    "phone": "+1234567890",
    "address": "123 Main Street, New York, NY 10001",
    "allergies": ["Penicillin", "Peanuts"],
    "dorraPatientId": "179",
    "userType": "patient",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 5. Get Patient Records

**Endpoint:** `GET /api/patient/records`

**Headers:**

```
Authorization: Bearer <patient_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "dorraRecords": {
      "patient": {
        "id": 179,
        "unique_id": "P0BYCLUOYC",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "date_of_birth": "1990-05-15",
        "gender": "Male",
        "phone_number": "+1234567890",
        "address": "123 Main Street, New York, NY 10001",
        "allergies": ["Penicillin", "Peanuts"]
      },
      "encounters": []
    },
    "localRecords": [
      {
        "_id": "64f8a1b2c3d4e5f6g7h8i9j2",
        "patientId": "64f8a1b2c3d4e5f6g7h8i9j0",
        "summary": "Patient presented with fever and cough",
        "symptoms": ["fever", "cough", "fatigue"],
        "diagnosis": "Upper respiratory infection",
        "medications": [
          {
            "name": "Amoxicillin",
            "dosage": "500mg",
            "frequency": "3 times daily"
          }
        ],
        "vitals": {
          "temperature": "38.5°C",
          "bloodPressure": "120/80"
        },
        "encounterDate": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**Note:** If patient has `dorraPatientId`, the response includes data from both Dorra EMR and local database.

---

### 6. Upload Medical Record (AI Extraction) 🤖

**Endpoint:** `POST /api/patient/upload-record`

**Description:** Uses Dorra AI to analyze medical text, automatically detect if it's an Encounter or Appointment, create the resource in Dorra EMR, and find available pharmacies with medication prices.

**Headers:**

```
Authorization: Bearer <patient_token>
```

**Request Body:**

```json
{
  "recordText": "Patient presented with severe headache and fever. Temperature 39.2C, BP 130/85. Diagnosed with viral infection. Prescribed Paracetamol 500mg three times daily for 5 days."
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "resource": "Encounter",
    "dorraResponse": {
      "status": true,
      "status_code": 201,
      "resource": "Encounter",
      "message": "Encounter created successfully",
      "id": 169,
      "available_pharmacies": [
        {
          "pharmacy_name": "SafeMed Pharmacy",
          "medications": [
            {
              "name": "Paracetamol 500mg",
              "price": 50
            }
          ]
        },
        {
          "pharmacy_name": "PureRx Pharmacy",
          "medications": [
            {
              "name": "Paracetamol 500mg",
              "price": 150
            }
          ]
        },
        {
          "pharmacy_name": "PillBox Pharmacy",
          "medications": [
            {
              "name": "Paracetamol 500mg",
              "price": 400
            }
          ]
        }
      ]
    },
    "savedEncounter": null
  },
  "message": "AI successfully created Encounter in Dorra EMR"
}
```

**Important Notes:**

- ✅ Patient must have `dorraPatientId` (automatically set during registration)
- ✅ Dorra AI analyzes the text and determines if it's an Encounter or Appointment
- ✅ The resource is **actually created** in Dorra EMR (not just extracted)
- ✅ Returns available pharmacies with medication prices
- ✅ `resource` can be: `"Encounter"`, `"Appointment"`, or `"Error"`
- ⚠️ If patient doesn't have `dorraPatientId`, returns 400 error

**Example Error Response (Patient not synced):**

```json
{
  "success": false,
  "message": "Patient must be synced to Dorra EMR to use AI extraction. Please contact support."
}
```

---

### 7. Log Symptom

**Endpoint:** `POST /api/patient/symptom`

**Headers:**

```
Authorization: Bearer <patient_token>
```

**Request Body:**

```json
{
  "symptom": "Headache",
  "severity": "moderate",
  "notes": "Started this morning, pain in temples"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j4",
    "patientId": "64f8a1b2c3d4e5f6g7h8i9j0",
    "symptom": "Headache",
    "severity": "moderate",
    "notes": "Started this morning, pain in temples",
    "loggedAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 8. Get Symptom History

**Endpoint:** `GET /api/patient/symptoms`

**Headers:**

```
Authorization: Bearer <patient_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j4",
      "patientId": "64f8a1b2c3d4e5f6g7h8i9j0",
      "symptom": "Headache",
      "severity": "moderate",
      "notes": "Started this morning, pain in temples",
      "loggedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 🏥 Clinic Routes

**Note:** All clinic routes require clinic authentication.

### 9. Get Patient Information

**Endpoint:** `GET /api/clinic/patient/:id`

**Headers:**

```
Authorization: Bearer <clinic_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "localPatient": {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "dob": "1990-05-15T00:00:00.000Z",
      "gender": "Male",
      "phone": "+1234567890",
      "address": "123 Main Street, New York, NY 10001",
      "allergies": ["Penicillin", "Peanuts"],
      "dorraPatientId": "179",
      "userType": "patient"
    },
    "dorraPatient": {
      "id": 179,
      "unique_id": "P0BYCLUOYC",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "date_of_birth": "1990-05-15",
      "gender": "Male",
      "phone_number": "+1234567890",
      "address": "123 Main Street, New York, NY 10001",
      "allergies": ["Penicillin", "Peanuts"]
    },
    "encounters": []
  }
}
```

**Note:** `dorraPatient` will be `null` if patient doesn't have a `dorraPatientId`.

---

### 10. Create Encounter

**Endpoint:** `POST /api/clinic/encounter`

**Headers:**

```
Authorization: Bearer <clinic_token>
```

**Request Body:**

```json
{
  "patientId": "64f8a1b2c3d4e5f6g7h8i9j0",
  "summary": "Annual checkup",
  "symptoms": [],
  "diagnosis": "Healthy",
  "medications": [],
  "vitals": {
    "bloodPressure": "118/75",
    "heartRate": "72 bpm",
    "temperature": "36.8°C",
    "weight": "75kg",
    "height": "175cm"
  }
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "localEncounter": {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j5",
      "patientId": "64f8a1b2c3d4e5f6g7h8i9j0",
      "summary": "Annual checkup",
      "symptoms": [],
      "diagnosis": "Healthy",
      "medications": [],
      "vitals": {
        "bloodPressure": "118/75",
        "heartRate": "72 bpm",
        "temperature": "36.8°C",
        "weight": "75kg",
        "height": "175cm"
      },
      "clinicId": "64f8a1b2c3d4e5f6g7h8i9j1",
      "encounterDate": "2024-01-15T10:30:00.000Z"
    },
    "dorraEncounter": null
  }
}
```

---

### 11. Get Encounter by ID (with Drug Interactions) 🆕

**Endpoint:** `GET /api/clinic/encounter/:id`

**Description:** Retrieves a specific encounter from Dorra EMR by ID. The response now includes a `drug_interactions` field that shows any interactions detected during the encounter, and a `patient_name` field.

**Headers:**

```
Authorization: Bearer <clinic_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 169,
    "patient": 181,
    "patient_name": "Test Patient AI",
    "chief_complaint": "Severe headache and fever",
    "diagnosis": "Viral infection",
    "medications": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "three times daily",
        "duration": "5 days"
      }
    ],
    "vitals": {
      "temperature": "39.2C",
      "blood_pressure": "130/85"
    },
    "symptoms": ["headache", "fever"],
    "drug_interactions": [],
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Example with Drug Interactions (Aspirin + Amlodipine):**

```json
{
  "success": true,
  "data": {
    "id": 171,
    "patient": 181,
    "patient_name": "Test Patient AI",
    "chief_complaint": "Hypertension and pain management",
    "diagnosis": "Hypertension with chronic pain",
    "medications": [
      {
        "name": "Aspirin",
        "dosage": "100mg",
        "frequency": "once daily"
      },
      {
        "name": "Amlodipine",
        "dosage": "5mg",
        "frequency": "once daily"
      }
    ],
    "drug_interactions": [
      {
        "drugs": ["Aspirin", "Amlodipine"],
        "severity": "moderate",
        "description": "Aspirin may increase the blood pressure-lowering effects of Amlodipine",
        "recommendation": "Monitor blood pressure regularly. Dosage adjustment may be needed."
      }
    ],
    "created_at": "2024-01-15T11:00:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**Important Notes:**

- ✅ `drug_interactions` field is automatically populated by Dorra's PharmaVigilance system
- ✅ `patient_name` field is now included in the response
- ✅ Test with medications like "Aspirin" and "Amlodipine" to see interactions
- ✅ Interactions are detected during encounter creation via webhook
- ✅ Use this endpoint to review encounters and check for any drug safety issues

---

### 12. Check Prescription (Drug Interactions)

**Endpoint:** `POST /api/clinic/prescription/check`

**Headers:**

```
Authorization: Bearer <clinic_token>
```

**Request Body:**

```json
{
  "medications": ["Aspirin", "Warfarin", "Ibuprofen"]
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "medications": ["Aspirin", "Warfarin", "Ibuprofen"],
    "interactions": [
      {
        "drugs": ["Aspirin", "Warfarin"],
        "severity": "high",
        "description": "Increased risk of bleeding"
      },
      {
        "drugs": ["Ibuprofen", "Warfarin"],
        "severity": "high",
        "description": "Increased risk of bleeding"
      }
    ],
    "severity": "high",
    "recommendations": [
      "Avoid concurrent use of Aspirin and Warfarin",
      "Monitor INR closely if combination is necessary",
      "Consider alternative pain management"
    ]
  }
}
```

---

## 🔑 Access Control Routes

### 13. Generate QR Code (Patient)

**Endpoint:** `POST /api/access/generate-qr`

**Headers:**

```
Authorization: Bearer <patient_token>
```

**Request Body:**

```json
{
  "clinicId": "64f8a1b2c3d4e5f6g7h8i9j1"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "accessGrant": {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j6",
      "patientId": "64f8a1b2c3d4e5f6g7h8i9j0",
      "clinicId": "64f8a1b2c3d4e5f6g7h8i9j1",
      "code": "a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p",
      "expiresAt": "2024-01-16T10:30:00.000Z",
      "isActive": true
    },
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

---

### 14. Scan QR Code (Clinic)

**Endpoint:** `GET /api/access/scan/:code`

**Headers:**

```
Authorization: Bearer <clinic_token>
```

**Example:** `GET /api/access/scan/a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "patient": {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "dob": "1990-05-15T00:00:00.000Z",
      "gender": "Male",
      "phone": "+1234567890",
      "address": "123 Main Street, New York, NY 10001",
      "allergies": ["Penicillin", "Peanuts"],
      "dorraPatientId": "179"
    },
    "accessGrant": {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j6",
      "expiresAt": "2024-01-16T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 15. Revoke Access (Patient)

**Endpoint:** `DELETE /api/access/revoke/:grantId`

**Headers:**

```
Authorization: Bearer <patient_token>
```

**Example:** `DELETE /api/access/revoke/64f8a1b2c3d4e5f6g7h8i9j6`

**Response (200):**

```json
{
  "success": true,
  "message": "Access grant revoked successfully"
}
```

---

## 🤖 AI Routes

### 16. AI EMR Extraction 🤖

**Endpoint:** `POST /api/ai/emr`

**Description:** Uses Dorra AI to analyze medical text for any patient, automatically detect if it's an Encounter or Appointment, create the resource in Dorra EMR, and find available pharmacies with medication prices. Can be used by both patients and clinics.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "text": "Patient complains of severe headache and nausea for 2 days. BP: 130/85, Temp: 37.2°C. Diagnosed with migraine. Prescribed Sumatriptan 50mg as needed.",
  "patientId": "64f8a1b2c3d4e5f6g7h8i9j0"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "resource": "Encounter",
    "dorraResponse": {
      "status": true,
      "status_code": 201,
      "resource": "Encounter",
      "message": "Encounter created successfully",
      "id": 170,
      "available_pharmacies": [
        {
          "pharmacy_name": "SafeMed Pharmacy",
          "medications": [
            {
              "name": "Sumatriptan 50mg",
              "price": 120
            }
          ]
        },
        {
          "pharmacy_name": "PureRx Pharmacy",
          "medications": [
            {
              "name": "Sumatriptan 50mg",
              "price": 180
            }
          ]
        }
      ]
    },
    "savedEncounter": {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j7",
      "patientId": "64f8a1b2c3d4e5f6g7h8i9j0",
      "dorraEncounterId": "170",
      "summary": "",
      "symptoms": [],
      "diagnosis": "",
      "medications": [],
      "vitals": {},
      "clinicId": "64f8a1b2c3d4e5f6g7h8i9j1",
      "encounterDate": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "AI successfully created Encounter in Dorra EMR"
}
```

**Important Notes:**

- ✅ `patientId` is **required** in the request body
- ✅ Patient must have `dorraPatientId` (automatically set during registration)
- ✅ Dorra AI analyzes the text and determines if it's an Encounter or Appointment
- ✅ The resource is **actually created** in Dorra EMR (not just extracted)
- ✅ Returns available pharmacies with medication prices
- ✅ `resource` can be: `"Encounter"`, `"Appointment"`, or `"Error"`
- ✅ If user is a clinic, the `clinicId` is automatically added to the saved encounter
- ⚠️ If patient doesn't have `dorraPatientId`, returns 400 error

**Example Error Response (Patient not synced):**

```json
{
  "success": false,
  "message": "Patient must be synced to Dorra EMR to use AI extraction"
}
```

**Example Error Response (Missing patientId):**

```json
{
  "success": false,
  "message": "Please provide patient ID"
}
```

---

### 17. AI Patient Creation (Clinic Only)

**Endpoint:** `POST /api/ai/patient`

**Headers:**

```
Authorization: Bearer <clinic_token>
```

**Request Body:**

```json
{
  "text": "New patient: Jane Smith, female, born March 12, 1985. Email: jane.smith@email.com. No known allergies. Previous history of asthma."
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "aiExtractedData": {
      "name": "Jane Smith",
      "email": "jane.smith@email.com",
      "dob": "1985-03-12",
      "gender": "female",
      "allergies": [],
      "medicalHistory": ["asthma"]
    },
    "createdPatient": {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j8",
      "name": "Jane Smith",
      "email": "jane.smith@email.com",
      "dob": "1985-03-12T00:00:00.000Z",
      "userType": "patient"
    }
  }
}
```

---

## 💊 Drug Interaction Routes

### 18. Check Drug Interactions

**Endpoint:** `POST /api/drugs/interactions`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "medications": ["Metformin", "Lisinopril", "Atorvastatin"]
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "medications": ["Metformin", "Lisinopril", "Atorvastatin"],
    "interactions": [
      {
        "drugs": ["Metformin", "Lisinopril"],
        "severity": "moderate",
        "description": "May increase risk of lactic acidosis in patients with renal impairment"
      }
    ],
    "severity": "moderate",
    "recommendations": [
      "Monitor renal function regularly",
      "Adjust Metformin dose if needed",
      "Watch for signs of lactic acidosis"
    ]
  }
}
```

---

## 🏥 Health Check

### 19. API Status

**Endpoint:** `GET /`

**Response (200):**

```json
{
  "success": true,
  "message": "Dosewise API is running",
  "version": "1.0.0"
}
```

---

### 20. Health Check

**Endpoint:** `GET /api/health`

**Response (200):**

```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔧 Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied. Patients only."
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Patient not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Server error message",
  "stack": "Error stack trace (development only)"
}
```

---

## 📌 Notes

1. **Authentication**: Most endpoints require a JWT token in the Authorization header
2. **User Types**: Routes are protected by user type (patient/clinic)
3. **Dorra Integration**: ✅ **FULLY WORKING!** Patients are automatically synced to Dorra EMR
   - API Base URL: `https://hackathon-api.aheadafrica.org`
   - Authentication: `Authorization: Token <API_KEY>`
   - Endpoint format: `/v1/{resource}` (no `/api` prefix)
4. **🆕 PharmaVigilance Features**:
   - `drug_interactions` field automatically added to encounters
   - Retrieve encounter by ID to see detected interactions
   - List all interactions via `/v1/pharmavigilance/interactions`
   - Test with "Aspirin" and "Amlodipine" to see interactions
5. **🆕 Enhanced Encounter Data**:
   - `patient_name` field now included in Tests, Encounters, and Appointments
   - Makes it easier to identify patients in responses
6. **QR Codes**: Generated QR codes expire after 24 hours by default
7. **Date Format**: All dates are in ISO 8601 format
8. **New Patient Fields**:
   - `gender` (Male/Female/Other) - Optional, defaults to "Male"
   - `phone` - Optional phone number
   - `address` - Optional physical address
   - `allergies` - Optional array of allergies
9. **Dorra Patient ID**:
   - Automatically assigned when patient is synced to Dorra EMR
   - Stored as `dorraPatientId` in local database
10. **Total Endpoints**: 20 API endpoints (updated with new encounter retrieval endpoint)

- Used to fetch patient data from Dorra EMR API
