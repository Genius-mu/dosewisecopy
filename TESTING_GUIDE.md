# 🧪 Testing Guide - Dosewise Backend

Complete guide for testing all API endpoints and features.

## Prerequisites

1. **Server Running:** `npm run dev`
2. **MongoDB Running:** Check with `brew services list` (macOS)
3. **Dorra API Key:** Set in `.env` file

---

## 🔄 Complete Test Flow

### Step 1: Health Check

```bash
curl http://localhost:4000/api/health
```

**Expected:** `200 OK` with health status

---

### Step 2: Register Patient

```bash
curl -X POST http://localhost:4000/api/auth/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "password123",
    "dob": "1992-03-15"
  }'
```

**Save the token from response!**

---

### Step 3: Register Clinic

```bash
curl -X POST http://localhost:4000/api/auth/clinic/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Robert Smith",
    "email": "dr.smith@hospital.com",
    "password": "securepass123",
    "hospital": "City General Hospital"
  }'
```

**Save the clinic token from response!**

---

### Step 4: Patient Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123",
    "userType": "patient"
  }'
```

---

### Step 5: Get Patient Profile

```bash
curl http://localhost:4000/api/patient/me \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

---

### Step 6: Log Symptom

```bash
curl -X POST http://localhost:4000/api/patient/symptom \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symptom": "Persistent headache",
    "severity": "moderate",
    "notes": "Started yesterday evening, pain in temples"
  }'
```

---

### Step 7: Get Symptom History

```bash
curl http://localhost:4000/api/patient/symptoms \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

---

### Step 8: Upload Medical Record (AI Extraction)

```bash
curl -X POST http://localhost:4000/api/patient/upload-record \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recordText": "Patient Alice Johnson, 31 years old. Chief complaint: Severe migraine headache for 3 days. Vitals: BP 125/82, Temp 37.1°C, HR 78 bpm. Diagnosis: Migraine with aura. Treatment: Prescribed Sumatriptan 50mg as needed, advised rest and hydration."
  }'
```

---

### Step 9: Check Drug Interactions

```bash
curl -X POST http://localhost:4000/api/drugs/interactions \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medications": ["Aspirin", "Warfarin", "Ibuprofen"]
  }'
```

---

### Step 10: Generate QR Code for Access

```bash
# First, get the clinic ID from Step 3 response
curl -X POST http://localhost:4000/api/access/generate-qr \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId": "CLINIC_ID_FROM_STEP_3"
  }'
```

**Save the QR code and access code!**

---

### Step 11: Clinic Scans QR Code

```bash
curl http://localhost:4000/api/access/scan/QR_CODE_FROM_STEP_10 \
  -H "Authorization: Bearer YOUR_CLINIC_TOKEN"
```

---

### Step 12: Clinic Views Patient Info

```bash
# Use patient ID from Step 2 response
curl http://localhost:4000/api/clinic/patient/PATIENT_ID \
  -H "Authorization: Bearer YOUR_CLINIC_TOKEN"
```

---

### Step 13: Clinic Creates Encounter

```bash
curl -X POST http://localhost:4000/api/clinic/encounter \
  -H "Authorization: Bearer YOUR_CLINIC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PATIENT_ID_FROM_STEP_2",
    "summary": "Annual physical examination",
    "symptoms": [],
    "diagnosis": "Patient in good health",
    "medications": [],
    "vitals": {
      "bloodPressure": "120/78",
      "heartRate": "72 bpm",
      "temperature": "36.9°C",
      "weight": "68kg",
      "height": "165cm"
    }
  }'
```

---

### Step 14: Clinic Checks Prescription

```bash
curl -X POST http://localhost:4000/api/clinic/prescription/check \
  -H "Authorization: Bearer YOUR_CLINIC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medications": ["Metformin", "Lisinopril", "Atorvastatin"]
  }'
```

---

### Step 15: AI EMR Extraction

```bash
curl -X POST http://localhost:4000/api/ai/emr \
  -H "Authorization: Bearer YOUR_CLINIC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Patient John Doe, 45 years old. Presents with chest pain and shortness of breath. BP: 145/95, HR: 95, Temp: 37.5°C. ECG shows ST elevation. Diagnosis: Acute myocardial infarction. Immediate treatment: Aspirin 325mg, Nitroglycerin sublingual, transferred to cardiac unit.",
    "patientId": "PATIENT_ID_FROM_STEP_2"
  }'
```

---

### Step 16: AI Patient Creation (Clinic Only)

```bash
curl -X POST http://localhost:4000/api/ai/patient \
  -H "Authorization: Bearer YOUR_CLINIC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "New patient registration: Sarah Williams, female, born July 22, 1988. Contact: sarah.w@email.com. Medical history: Type 2 diabetes, hypertension. Allergies: Penicillin."
  }'
```

---

## ✅ Testing Checklist

### Authentication

- [ ] Patient registration works
- [ ] Clinic registration works
- [ ] Login returns token
- [ ] Invalid credentials rejected

### Patient Features

- [ ] Get profile works
- [ ] Log symptoms works
- [ ] Upload records works
- [ ] AI extraction works
- [ ] Get symptom history works

### Clinic Features

- [ ] View patient info works
- [ ] Create encounter works
- [ ] Check prescriptions works
- [ ] QR scanning works

### Access Control

- [ ] QR generation works
- [ ] QR scanning works
- [ ] Access revocation works

### AI Features

- [ ] EMR extraction works
- [ ] Patient creation works

---

**Testing Complete! 🎉**
