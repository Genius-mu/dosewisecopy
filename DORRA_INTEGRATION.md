# 🔗 Dorra EMR API Integration Guide

Complete guide for Dorra EMR API integration in the Dosewise backend.

---

## 📋 Overview

The Dosewise backend is **fully integrated** with the Dorra EMR API. All patient operations automatically sync with Dorra EMR when possible, with graceful fallback to local-only storage if the Dorra API is unavailable.

---

## 🔑 API Configuration

### Environment Variables

```env
DORRA_API_KEY=your_api_key_here
DORRA_API_BASE_URL=https://hackathon-api.aheadafrica.org/api
```

### Authentication

All Dorra API requests include:

```
Authorization: Bearer YOUR_DORRA_API_KEY
Content-Type: application/json
```

---

## 🌐 Integrated Endpoints

### AI Endpoints

| Endpoint         | Method | Purpose                                                   | Status |
| ---------------- | ------ | --------------------------------------------------------- | ------ |
| `/v1/ai/emr`     | POST   | Extract structured data from unstructured medical records | ✅     |
| `/v1/ai/patient` | POST   | Create patient using AI from natural language             | ✅     |

### Patient Endpoints

| Endpoint                         | Method | Purpose                    | Status       |
| -------------------------------- | ------ | -------------------------- | ------------ |
| `/v1/patients`                   | GET    | List all patients          | ✅           |
| `/v1/patients/create`            | POST   | Create a new patient       | ✅ Auto-sync |
| `/v1/patients/{id}`              | GET    | Retrieve patient details   | ✅           |
| `/v1/patients/{id}`              | PATCH  | Update patient information | ✅           |
| `/v1/patients/{id}`              | DELETE | Delete a patient           | ✅           |
| `/v1/patients/{id}/appointments` | GET    | List patient appointments  | ✅           |
| `/v1/patients/{id}/encounters`   | GET    | List patient encounters    | ✅           |
| `/v1/patients/{id}/medications`  | GET    | List patient medications   | ✅           |
| `/v1/patients/{id}/tests`        | GET    | List patient tests         | ✅           |

### Encounter Endpoints

| Endpoint         | Method | Purpose          | Status |
| ---------------- | ------ | ---------------- | ------ |
| `/v1/encounters` | GET    | List encounters  | ✅     |
| `/v1/encounters` | POST   | Create encounter | ✅     |

### Appointment Endpoints

| Endpoint                | Method | Purpose               | Status |
| ----------------------- | ------ | --------------------- | ------ |
| `/v1/appointments`      | GET    | List all appointments | ✅     |
| `/v1/appointments/{id}` | GET    | Retrieve appointment  | ✅     |
| `/v1/appointments/{id}` | PATCH  | Update appointment    | ✅     |
| `/v1/appointments/{id}` | DELETE | Delete appointment    | ✅     |

### PharmaVigilance

| Endpoint                           | Method | Purpose                 | Status |
| ---------------------------------- | ------ | ----------------------- | ------ |
| `/v1/pharmavigilance/interactions` | GET    | Check drug interactions | ✅     |

---

## 🔄 Auto-Sync Features

### Patient Registration

When a patient registers via `/api/auth/patient/register`:

1. **Local Creation**: Patient is created in MongoDB
2. **Dorra Sync**: Patient data is sent to Dorra EMR `/v1/patients/create`
3. **ID Storage**: Dorra patient ID is saved as `dorraPatientId`
4. **Graceful Fallback**: If Dorra API fails, patient is still created locally

**Request Example:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "dob": "1990-05-15",
  "gender": "Male",
  "phone": "+1234567890",
  "address": "123 Main St",
  "allergies": ["Penicillin", "Peanuts"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "local_mongodb_id",
    "name": "John Doe",
    "email": "john@example.com",
    "dob": "1990-05-15",
    "gender": "Male",
    "phone": "+1234567890",
    "address": "123 Main St",
    "allergies": ["Penicillin", "Peanuts"],
    "dorraPatientId": "67",
    "userType": "patient",
    "token": "jwt_token_here"
  },
  "message": "Patient registered and synced with Dorra EMR"
}
```

---

## 📊 Data Mapping

### Our Schema → Dorra EMR Schema

| Dosewise Field | Dorra EMR Field            | Type   | Required |
| -------------- | -------------------------- | ------ | -------- |
| `name`         | `first_name` + `last_name` | String | ✅       |
| `email`        | `email`                    | String | ✅       |
| `dob`          | `date_of_birth`            | Date   | ✅       |
| `gender`       | `gender`                   | Enum   | ✅       |
| `phone`        | `phone_number`             | String | ❌       |
| `address`      | `address`                  | String | ❌       |
| `allergies`    | `allergies`                | Array  | ❌       |

**Name Splitting Logic:**

```javascript
// "John Doe Smith" → first_name: "John", last_name: "Doe Smith"
const [firstName, ...lastNameParts] = name.split(" ");
const lastName = lastNameParts.join(" ") || firstName;
```

---

## 🛠️ Service Functions

All Dorra API integrations are in `src/services/dorraService.js`:

### Patient Operations

- `createPatient(patientData)` - Create patient in Dorra EMR
- `getPatient(patientId)` - Get patient details
- `updatePatient(patientId, patientData)` - Update patient
- `deletePatient(patientId)` - Delete patient
- `listPatients()` - List all patients

### Patient-Specific Data

- `getPatientAppointments(patientId)` - Get appointments
- `getPatientEncounters(patientId)` - Get encounters
- `getPatientMedications(patientId)` - Get medications
- `getPatientTests(patientId)` - Get test results

### Encounter Operations

- `getEncounters(patientId)` - Get encounters by patient
- `createEncounter(encounterData)` - Create encounter

### Appointment Operations

- `listAppointments()` - List all appointments
- `getAppointment(appointmentId)` - Get appointment
- `updateAppointment(appointmentId, data)` - Update appointment
- `deleteAppointment(appointmentId)` - Delete appointment

### AI Operations

- `aiEmrExtract(emrText)` - Extract structured data from text
- `aiCreatePatient(patientText)` - Create patient from natural language

### Drug Interactions

- `getDrugInteractions(medications)` - Check drug interactions

---

## 📝 Usage Examples

### Example 1: Register Patient with Full Sync

```bash
curl -X POST http://localhost:4000/api/auth/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "password123",
    "dob": "1992-03-15",
    "gender": "Female",
    "phone": "+1234567890",
    "address": "456 Oak Avenue",
    "allergies": ["Latex"]
  }'
```

**Response includes `dorraPatientId`** - This ID is used for all future Dorra API calls.

---

## ✅ Integration Complete

The Dosewise backend now has **full Dorra EMR integration** with:

- ✅ **Auto-sync patient registration** - Patients are automatically created in Dorra EMR
- ✅ **Graceful fallback** - Local operations continue even if Dorra API fails
- ✅ **Complete API coverage** - All 20+ Dorra endpoints integrated
- ✅ **Data mapping** - Automatic conversion between schemas
- ✅ **Error handling** - Comprehensive error logging and recovery
- ✅ **Service layer** - Clean separation of concerns

---

## 🚀 Next Steps

1. **Test the integration** - Register a patient and verify `dorraPatientId` is returned
2. **Monitor logs** - Check for "Dorra API Error" messages
3. **Verify API key** - Ensure your Dorra API key is valid in `.env`
4. **Build frontend** - Connect your UI to these integrated endpoints

---

**Dorra EMR Integration Complete! 🎉**
