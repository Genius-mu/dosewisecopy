# 🏥 Clinic-Patient Relationship Guide

Complete guide on how clinics connect to patients and access their medical records in Dosewise.

---

## 🔐 **Access Control Model: QR-Based Authorization**

Your system uses a **patient-controlled, QR-based access system**. This means:

✅ **Patients control who sees their data**  
✅ **Temporary, revocable access**  
✅ **Secure, time-limited permissions**  
✅ **HIPAA-compliant access control**

---

## 📊 **The Relationship Flow**

```
┌─────────────┐                    ┌─────────────┐
│   PATIENT   │                    │   CLINIC    │
│             │                    │             │
│  Registers  │                    │  Registers  │
│  & Syncs    │                    │             │
│  to Dorra   │                    │             │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  1. Patient generates QR code    │
       │     for specific clinic          │
       │                                  │
       ├──────────────────────────────────>
       │     QR Code (24hr expiry)        │
       │                                  │
       │  2. Clinic scans QR code         │
       <──────────────────────────────────┤
       │                                  │
       │  3. Clinic gets patient ID       │
       │     and access grant             │
       │                                  │
       │  4. Clinic fetches patient       │
       │     records using patient ID     │
       <──────────────────────────────────┤
       │                                  │
       │  5. Clinic creates encounters    │
       │     linked to patient            │
       <──────────────────────────────────┤
       │                                  │
       │  6. Patient can revoke access    │
       │     at any time                  │
       ├──────────────────────────────────>
       │                                  │
```

---

## 🔑 **Step-by-Step: How Clinics Access Patient Records**

### **Step 1: Patient Generates QR Code**

**Patient Action:**

```bash
POST /api/access/generate-qr
Authorization: Bearer <patient_token>

{
  "clinicId": "64f8a1b2c3d4e5f6g7h8i9j1"
}
```

**What Happens:**

1. System creates an `AccessGrant` record in database
2. Links patient ID + clinic ID
3. Generates unique code (UUID)
4. Sets expiration (24 hours by default)
5. Creates QR code image with the code
6. Returns QR code to patient

**Database Record Created:**

```javascript
{
  _id: "grant123",
  patientId: "patient456",
  clinicId: "clinic789",
  code: "a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p",
  expiresAt: "2024-01-16T10:30:00.000Z",
  isActive: true
}
```

---

### **Step 2: Clinic Scans QR Code**

**Clinic Action:**

```bash
GET /api/access/scan/a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p
Authorization: Bearer <clinic_token>
```

**What Happens:**

1. System finds `AccessGrant` by code
2. Validates:
   - ✅ Grant exists
   - ✅ Not expired
   - ✅ Still active (not revoked)
   - ✅ Clinic ID matches the logged-in clinic
3. Returns patient information

**Response:**

```json
{
  "success": true,
  "data": {
    "patient": {
      "_id": "patient456",
      "name": "John Doe",
      "email": "john@example.com",
      "dob": "1990-05-15",
      "gender": "Male",
      "phone": "+1234567890",
      "dorraPatientId": "179"
    },
    "accessGrant": {
      "_id": "grant123",
      "expiresAt": "2024-01-16T10:30:00.000Z"
    }
  }
}
```

**Now the clinic has the patient's ID!** 🎉

---

### **Step 3: Clinic Fetches Full Patient Records**

**Clinic Action:**

```bash
GET /api/clinic/patient/patient456
Authorization: Bearer <clinic_token>
```

**What Happens:**

1. Fetches patient from local MongoDB
2. If patient has `dorraPatientId`, fetches from Dorra EMR
3. Fetches all encounters (medical history)
4. Returns combined data

**Response:**

```json
{
  "success": true,
  "data": {
    "localPatient": {
      "_id": "patient456",
      "name": "John Doe",
      "email": "john@example.com",
      "dob": "1990-05-15",
      "gender": "Male",
      "phone": "+1234567890",
      "address": "123 Main St",
      "allergies": ["Penicillin"],
      "dorraPatientId": "179"
    },
    "dorraPatient": {
      "id": 179,
      "unique_id": "P0BYCLUOYC",
      "first_name": "John",
      "last_name": "Doe"
      // ... full Dorra EMR data
    },
    "encounters": [
      {
        "_id": "encounter123",
        "summary": "Annual checkup",
        "diagnosis": "Healthy",
        "encounterDate": "2024-01-10"
      }
    ]
  }
}
```

---

### **Step 4: Clinic Creates Medical Encounter**

**Clinic Action:**

```bash
POST /api/clinic/encounter
Authorization: Bearer <clinic_token>

{
  "patientId": "patient456",
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
    "bloodPressure": "120/80",
    "heartRate": "85 bpm"
  }
}
```

**What Happens:**

1. Creates encounter in local MongoDB
2. Links encounter to patient ID
3. Links encounter to clinic ID (who created it)
4. If patient has `dorraPatientId`, also creates in Dorra EMR
5. Stores Dorra encounter ID for reference

**Database Records:**

**Local Encounter:**

```javascript
{
  _id: "encounter789",
  patientId: "patient456",
  clinicId: "clinic789",
  dorraEncounterId: "dorra_enc_123",
  summary: "Patient presented with fever and cough",
  symptoms: ["fever", "cough", "fatigue"],
  diagnosis: "Upper respiratory infection",
  medications: [...],
  vitals: {...},
  encounterDate: "2024-01-15T10:30:00.000Z"
}
```

---

### **Step 5: Patient Can Revoke Access**

**Patient Action:**

```bash
DELETE /api/access/revoke/grant123
Authorization: Bearer <patient_token>
```

**What Happens:**

1. Finds the access grant
2. Verifies patient owns it
3. Sets `isActive: false`
4. Clinic can no longer use that QR code

---

## 🗄️ **Database Relationships**

### **AccessGrant Model**

```javascript
{
  patientId: ObjectId → PatientUser,  // Who is granting access
  clinicId: ObjectId → ClinicUser,    // Who is receiving access
  code: String (UUID),                // QR code content
  expiresAt: Date,                    // When access expires
  isActive: Boolean                   // Can be revoked
}
```

### **Encounter Model**

```javascript
{
  patientId: ObjectId → PatientUser,  // Which patient
  clinicId: ObjectId → ClinicUser,    // Which clinic created it
  dorraEncounterId: String,           // Dorra EMR reference
  summary: String,
  symptoms: [String],
  diagnosis: String,
  medications: [{name, dosage, frequency}],
  vitals: {bloodPressure, heartRate, temperature, ...},
  encounterDate: Date
}
```

---

## 🔒 **Security Features**

### **1. Patient-Controlled Access**

- ✅ Patient must explicitly grant access to each clinic
- ✅ Patient chooses which clinic gets access
- ✅ Patient can revoke access at any time

### **2. Time-Limited Access**

- ✅ QR codes expire after 24 hours
- ✅ Prevents long-term unauthorized access
- ✅ Patient must regenerate for new visits

### **3. Clinic Verification**

- ✅ System verifies clinic ID matches the grant
- ✅ Prevents clinic A from using clinic B's QR code
- ✅ Each scan validates the requesting clinic

### **4. Audit Trail**

- ✅ All encounters linked to clinic ID
- ✅ Timestamps on all access grants
- ✅ Can track who accessed what and when

---

## 📱 **Real-World Usage Flow**

### **Scenario: Patient Visits Clinic**

**1. Before Visit:**

```
Patient opens Dosewise app
→ Selects "Grant Access to Clinic"
→ Chooses "City General Hospital"
→ Generates QR code
→ Shows QR code on phone screen
```

**2. At Clinic:**

```
Receptionist scans QR code with clinic app
→ System validates and returns patient info
→ Doctor opens patient record
→ Sees full medical history from Dorra EMR
→ Sees previous encounters
→ Sees allergies and medications
```

**3. During Consultation:**

```
Doctor examines patient
→ Creates new encounter in system
→ Adds diagnosis, medications, vitals
→ Encounter saved to both local DB and Dorra EMR
→ Patient's record updated
```

**4. After Visit:**

```
Patient can view new encounter in their app
→ Can see what doctor prescribed
→ Can revoke clinic access if desired
→ QR code expires after 24 hours automatically
```

---

## 🔍 **How Clinics Get Different Types of Data**

### **1. Basic Patient Info**

**Source:** QR code scan

```javascript
GET /api/access/scan/:code
// Returns: name, email, dob, dorraPatientId
```

### **2. Full Patient Profile**

**Source:** Patient endpoint

```javascript
GET /api/clinic/patient/:id
// Returns:
// - Local patient data
// - Dorra EMR patient data
// - All encounters
```

### **3. Medical History**

**Source:** Encounters collection

```javascript
// Automatically included in patient endpoint
// Filtered by patientId
// Sorted by date (newest first)
```

### **4. Dorra EMR Records**

**Source:** Dorra API (if dorraPatientId exists)

```javascript
// Fetched via dorraService.getPatient(dorraPatientId)
// Includes:
// - Patient demographics
// - Appointments
// - Medications
// - Test results
```

---

## 🎯 **Key Points**

1. **No Direct Clinic-Patient Link**

   - Clinics don't have permanent access to patients
   - Access is temporary and controlled by patient
   - Uses `AccessGrant` as intermediary

2. **Patient ID is the Key**

   - Once clinic scans QR, they get patient ID
   - Patient ID used for all subsequent requests
   - Patient ID links to both local and Dorra data

3. **Dual Storage**

   - Patient data in MongoDB (local)
   - Patient data in Dorra EMR (external)
   - System merges both sources

4. **Encounter Tracking**

   - Every clinic visit creates an encounter
   - Encounters linked to both patient and clinic
   - Builds complete medical history

5. **Privacy First**
   - Patient controls access
   - Time-limited permissions
   - Revocable at any time
   - Audit trail maintained

---

## 📚 **Related Documentation**

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture diagrams
- **[DORRA_INTEGRATION.md](DORRA_INTEGRATION.md)** - Dorra EMR integration details
- **[POSTMAN_EXAMPLES.md](POSTMAN_EXAMPLES.md)** - API request examples
- **[DORRA_INTEGRATION_SUCCESS.md](DORRA_INTEGRATION_SUCCESS.md)** - Integration test results

---

## 🚀 **Quick Reference**

| Action           | Endpoint                             | Who     | Returns                     |
| ---------------- | ------------------------------------ | ------- | --------------------------- |
| Generate QR      | `POST /api/access/generate-qr`       | Patient | QR code + access grant      |
| Scan QR          | `GET /api/access/scan/:code`         | Clinic  | Patient basic info          |
| Get Records      | `GET /api/clinic/patient/:id`        | Clinic  | Full patient data + history |
| Create Encounter | `POST /api/clinic/encounter`         | Clinic  | New encounter record        |
| Revoke Access    | `DELETE /api/access/revoke/:grantId` | Patient | Success message             |

---

**Your system provides secure, patient-controlled access to medical records with full Dorra EMR integration!** 🏥✨
