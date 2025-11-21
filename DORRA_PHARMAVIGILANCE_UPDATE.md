# 🆕 Dorra API Updates - PharmaVigilance & Enhanced Data

## 📋 Summary

Dorra has released two important updates to their API:

1. **PharmaVigilance API Enhancement** - Drug interactions now included in encounter responses
2. **Patient Name Field** - Added to Tests, Encounters, and Appointments

---

## 1️⃣ PharmaVigilance API Enhancement

### **What Changed**

Dorra has added a `drug_interactions` field to the **Retrieve Encounter** endpoint (`/v1/encounters/{id}`).

This field automatically contains any drug interactions detected during the encounter creation.

### **Why This Matters**

- ✅ **No webhook integration required** - Previously, you needed to set up webhooks to get interaction alerts
- ✅ **Automatic detection** - Interactions are detected when encounters are created
- ✅ **Easy access** - Simply retrieve the encounter to see any interactions
- ✅ **Safety** - Helps identify potentially dangerous drug combinations

### **How It Works**

1. **Create an encounter** with medications (e.g., Aspirin + Amlodipine)
2. **Dorra's PharmaVigilance system** automatically detects interactions
3. **Retrieve the encounter** by ID to see the `drug_interactions` field
4. **Review interactions** and take appropriate action

### **Example: Testing Drug Interactions**

**Step 1: Create encounter with Aspirin and Amlodipine**

```bash
POST /api/clinic/encounter
{
  "patientId": "64f8a1b2c3d4e5f6g7h8i9j0",
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
  ]
}
```

**Step 2: Retrieve the encounter**

```bash
GET /api/clinic/encounter/171
```

**Response includes drug_interactions:**

```json
{
  "success": true,
  "data": {
    "id": 171,
    "patient": 181,
    "patient_name": "Test Patient AI",
    "medications": [
      {"name": "Aspirin", "dosage": "100mg"},
      {"name": "Amlodipine", "dosage": "5mg"}
    ],
    "drug_interactions": [
      {
        "drugs": ["Aspirin", "Amlodipine"],
        "severity": "moderate",
        "description": "Aspirin may increase the blood pressure-lowering effects of Amlodipine",
        "recommendation": "Monitor blood pressure regularly. Dosage adjustment may be needed."
      }
    ]
  }
}
```

### **Additional Endpoint**

You can also list **all interactions** detected across all encounters:

```bash
GET /v1/pharmavigilance/interactions
```

This returns a list of all drug interactions detected in your system.

---

## 2️⃣ Patient Name Field Added

### **What Changed**

The `patient_name` field has been added to:
- ✅ Tests
- ✅ Encounters
- ✅ Appointments

### **Why This Matters**

- ✅ **Easier identification** - No need to look up patient ID separately
- ✅ **Better UX** - Display patient name directly in lists
- ✅ **Reduced API calls** - Don't need to fetch patient details separately

### **Example**

**Before:**
```json
{
  "id": 169,
  "patient": 181,
  "diagnosis": "Viral infection"
}
```

**After:**
```json
{
  "id": 169,
  "patient": 181,
  "patient_name": "Test Patient AI",
  "diagnosis": "Viral infection"
}
```

---

## 🔧 Implementation in Dosewise

### **New Endpoint Added**

We've added a new endpoint to retrieve encounters with drug interactions:

```
GET /api/clinic/encounter/:id
```

**Features:**
- ✅ Fetches encounter from Dorra EMR
- ✅ Includes `drug_interactions` field
- ✅ Includes `patient_name` field
- ✅ Returns complete encounter data

**Usage:**
```bash
GET /api/clinic/encounter/169
Authorization: Bearer <clinic_token>
```

### **Updated Files**

1. **`src/config/constants.js`** - Added `ENCOUNTER_BY_ID` endpoint
2. **`src/services/dorraService.js`** - Added `getEncounter()` function
3. **`src/controllers/clinicController.js`** - Added `getEncounterById()` controller
4. **`src/routes/clinicRoutes.js`** - Added `GET /encounter/:id` route
5. **`POSTMAN_EXAMPLES.md`** - Added endpoint #11 with examples
6. **`README.md`** - Updated endpoint list

---

## 🧪 Testing

### **Test Drug Interactions**

Use these medication combinations to test:

1. **Aspirin + Amlodipine** - Moderate interaction
2. **Aspirin + Warfarin** - High severity (bleeding risk)
3. **Ibuprofen + Warfarin** - High severity (bleeding risk)

### **Test Steps**

1. Create an encounter with interacting medications
2. Note the encounter ID from the response
3. Retrieve the encounter by ID
4. Check the `drug_interactions` field
5. Verify `patient_name` is included

---

## 📊 Benefits

| Feature | Before | After |
|---------|--------|-------|
| **Drug Interactions** | Webhook required | Included in encounter response |
| **Patient Name** | Separate API call needed | Included in response |
| **Safety Checks** | Manual | Automatic |
| **API Calls** | More calls needed | Fewer calls needed |

---

## ✅ Status

| Feature | Status | Notes |
|---------|--------|-------|
| Get Encounter by ID | ✅ Implemented | New endpoint added |
| Drug Interactions Field | ✅ Working | Automatically populated by Dorra |
| Patient Name Field | ✅ Working | Included in all responses |
| Documentation | ✅ Complete | POSTMAN examples updated |
| Testing | ✅ Ready | Test with Aspirin + Amlodipine |

---

**Your Dosewise backend now supports the latest Dorra PharmaVigilance features!** 💊🔍✅

