module.exports = {
  DORRA_API: {
    BASE_URL:
      process.env.DORRA_API_BASE_URL || "https://hackathon-api.aheadafrica.org",
    ENDPOINTS: {
      // AI Endpoints
      AI_EMR: "/v1/ai/emr",
      AI_PATIENT: "/v1/ai/patient",

      // Patient Endpoints
      PATIENTS: "/v1/patients",
      PATIENTS_CREATE: "/v1/patients/create",
      PATIENT_BY_ID: "/v1/patients", // append /{id}
      PATIENT_APPOINTMENTS: "/v1/patients", // append /{id}/appointments
      PATIENT_ENCOUNTERS: "/v1/patients", // append /{id}/encounters
      PATIENT_MEDICATIONS: "/v1/patients", // append /{id}/medications
      PATIENT_TESTS: "/v1/patients", // append /{id}/tests

      // Encounter Endpoints
      ENCOUNTERS: "/v1/encounters",
      ENCOUNTER_BY_ID: "/v1/encounters", // append /{id}

      // Appointment Endpoints
      APPOINTMENTS: "/v1/appointments",
      APPOINTMENT_BY_ID: "/v1/appointments", // append /{id}

      // PharmaVigilance
      DRUG_INTERACTIONS: "/v1/pharmavigilance/interactions",

      // Webhook Auth
      WEBHOOK_REGISTER: "/v1/auth/webhook/register",
      WEBHOOK_TEST: "/v1/auth/webhook/test",
    },
  },
  USER_TYPES: {
    PATIENT: "patient",
    CLINIC: "clinic",
  },
  QR_EXPIRY_HOURS: 24,
};
