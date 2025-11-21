const axios = require("axios");
const { DORRA_API } = require("../config/constants");

// Create axios instance with default config
// Dorra API uses "Token" prefix instead of "Bearer"
const dorraClient = axios.create({
  baseURL: DORRA_API.BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Token ${process.env.DORRA_API_KEY}`,
  },
});

/**
 * Map our patient data to Dorra EMR format
 */
const mapPatientToDorra = (patientData) => {
  const [firstName, ...lastNameParts] = (patientData.name || "").split(" ");
  const lastName = lastNameParts.join(" ") || firstName;

  return {
    first_name: firstName || "",
    last_name: lastName || "",
    date_of_birth: patientData.dob || patientData.date_of_birth,
    gender: patientData.gender || "Male", // Default if not provided
    email: patientData.email,
    phone_number: patientData.phone || patientData.phone_number || "",
    address: patientData.address || "",
    age: patientData.age || "",
    allergies: patientData.allergies || [],
  };
};

/**
 * Create a patient in Dorra EMR using the AI endpoint as fallback
 * Try multiple endpoints to find the working one
 */
const createPatient = async (patientData) => {
  try {
    const dorraPatientData = mapPatientToDorra(patientData);

    // Try the standard create endpoint first
    try {
      const response = await dorraClient.post(
        DORRA_API.ENDPOINTS.PATIENTS_CREATE,
        dorraPatientData
      );
      return response.data;
    } catch (createError) {
      // If standard endpoint fails, try AI patient creation as fallback
      console.log("Standard endpoint failed, trying AI patient creation...");

      const aiPrompt = `Create a patient: ${dorraPatientData.first_name} ${dorraPatientData.last_name}, email: ${dorraPatientData.email}, DOB: ${dorraPatientData.date_of_birth}, gender: ${dorraPatientData.gender}, phone: ${dorraPatientData.phone_number}, address: ${dorraPatientData.address}`;

      const aiResponse = await dorraClient.post(
        DORRA_API.ENDPOINTS.AI_PATIENT,
        { prompt: aiPrompt }
      );
      return aiResponse.data;
    }
  } catch (error) {
    console.error(
      "Dorra API Error (createPatient):",
      error.response?.data || error.message
    );

    // Log the full error for debugging
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
      console.error("Request URL:", error.config?.url);
    }

    throw new Error(
      error.response?.data?.message ||
        "Failed to create patient in Dorra EMR - API may be unavailable"
    );
  }
};

/**
 * Get patient details from Dorra EMR
 */
const getPatient = async (patientId) => {
  try {
    const response = await dorraClient.get(
      `${DORRA_API.ENDPOINTS.PATIENTS}/${patientId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (getPatient):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch patient from Dorra EMR"
    );
  }
};

/**
 * Get patient encounters from Dorra EMR
 */
const getEncounters = async (patientId) => {
  try {
    const response = await dorraClient.get(
      `${DORRA_API.ENDPOINTS.ENCOUNTERS}?patientId=${patientId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (getEncounters):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch encounters from Dorra EMR"
    );
  }
};

/**
 * Get a specific encounter by ID from Dorra EMR
 */
const getEncounter = async (encounterId) => {
  try {
    const response = await dorraClient.get(
      `${DORRA_API.ENDPOINTS.ENCOUNTER_BY_ID}/${encounterId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (getEncounter):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch encounter from Dorra EMR"
    );
  }
};

/**
 * Create an encounter in Dorra EMR
 */
const createEncounter = async (encounterData) => {
  try {
    const response = await dorraClient.post(
      DORRA_API.ENDPOINTS.ENCOUNTERS,
      encounterData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (createEncounter):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to create encounter in Dorra EMR"
    );
  }
};

/**
 * AI EMR Extraction - Extract structured data from unstructured medical records
 * @param {string} prompt - The medical record text/prompt
 * @param {number} dorraPatientId - The Dorra patient ID (integer)
 */
const aiEmrExtract = async (prompt, dorraPatientId) => {
  try {
    if (!dorraPatientId) {
      throw new Error(
        "Patient must be synced to Dorra EMR to use AI extraction"
      );
    }

    const response = await dorraClient.post(DORRA_API.ENDPOINTS.AI_EMR, {
      prompt: prompt,
      patient: parseInt(dorraPatientId), // Must be integer
    });
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (aiEmrExtract):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to extract EMR data using AI"
    );
  }
};

/**
 * AI Patient Creation - Create patient using AI from unstructured data
 */
const aiCreatePatient = async (patientText) => {
  try {
    const response = await dorraClient.post(DORRA_API.ENDPOINTS.AI_PATIENT, {
      prompt: patientText, // Changed from 'text' to 'prompt' to match Dorra API
    });
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (aiCreatePatient):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to create patient using AI"
    );
  }
};

/**
 * Check drug interactions using PharmaVigilance API
 */
const getDrugInteractions = async (medications) => {
  try {
    // Build query string with medications
    const medicationParams = medications
      .map((med) => `medications=${encodeURIComponent(med)}`)
      .join("&");
    const response = await dorraClient.get(
      `${DORRA_API.ENDPOINTS.DRUG_INTERACTIONS}?${medicationParams}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (getDrugInteractions):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to check drug interactions"
    );
  }
};

/**
 * Update a patient in Dorra EMR
 */
const updatePatient = async (patientId, patientData) => {
  try {
    const dorraPatientData = mapPatientToDorra(patientData);
    const response = await dorraClient.patch(
      `${DORRA_API.ENDPOINTS.PATIENT_BY_ID}/${patientId}`,
      dorraPatientData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (updatePatient):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to update patient in Dorra EMR"
    );
  }
};

/**
 * Delete a patient from Dorra EMR
 */
const deletePatient = async (patientId) => {
  try {
    const response = await dorraClient.delete(
      `${DORRA_API.ENDPOINTS.PATIENT_BY_ID}/${patientId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (deletePatient):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to delete patient from Dorra EMR"
    );
  }
};

/**
 * List all patients from Dorra EMR
 */
const listPatients = async () => {
  try {
    const response = await dorraClient.get(DORRA_API.ENDPOINTS.PATIENTS);
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (listPatients):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to list patients from Dorra EMR"
    );
  }
};

/**
 * Get patient appointments from Dorra EMR
 */
const getPatientAppointments = async (patientId) => {
  try {
    const response = await dorraClient.get(
      `${DORRA_API.ENDPOINTS.PATIENT_APPOINTMENTS}/${patientId}/appointments`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (getPatientAppointments):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch patient appointments"
    );
  }
};

/**
 * Get patient encounters from Dorra EMR (using patient-specific endpoint)
 */
const getPatientEncounters = async (patientId) => {
  try {
    const response = await dorraClient.get(
      `${DORRA_API.ENDPOINTS.PATIENT_ENCOUNTERS}/${patientId}/encounters`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (getPatientEncounters):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch patient encounters"
    );
  }
};

/**
 * Get patient medications from Dorra EMR
 */
const getPatientMedications = async (patientId) => {
  try {
    const response = await dorraClient.get(
      `${DORRA_API.ENDPOINTS.PATIENT_MEDICATIONS}/${patientId}/medications`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (getPatientMedications):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch patient medications"
    );
  }
};

/**
 * Get patient tests from Dorra EMR
 */
const getPatientTests = async (patientId) => {
  try {
    const response = await dorraClient.get(
      `${DORRA_API.ENDPOINTS.PATIENT_TESTS}/${patientId}/tests`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (getPatientTests):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch patient tests"
    );
  }
};

/**
 * List all appointments from Dorra EMR
 */
const listAppointments = async () => {
  try {
    const response = await dorraClient.get(DORRA_API.ENDPOINTS.APPOINTMENTS);
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (listAppointments):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to list appointments"
    );
  }
};

/**
 * Get appointment by ID from Dorra EMR
 */
const getAppointment = async (appointmentId) => {
  try {
    const response = await dorraClient.get(
      `${DORRA_API.ENDPOINTS.APPOINTMENT_BY_ID}/${appointmentId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (getAppointment):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch appointment"
    );
  }
};

/**
 * Update appointment in Dorra EMR
 */
const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const response = await dorraClient.patch(
      `${DORRA_API.ENDPOINTS.APPOINTMENT_BY_ID}/${appointmentId}`,
      appointmentData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (updateAppointment):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to update appointment"
    );
  }
};

/**
 * Delete appointment from Dorra EMR
 */
const deleteAppointment = async (appointmentId) => {
  try {
    const response = await dorraClient.delete(
      `${DORRA_API.ENDPOINTS.APPOINTMENT_BY_ID}/${appointmentId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Dorra API Error (deleteAppointment):",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to delete appointment"
    );
  }
};

module.exports = {
  // Patient operations
  createPatient,
  getPatient,
  updatePatient,
  deletePatient,
  listPatients,

  // Patient-specific data
  getPatientAppointments,
  getPatientEncounters,
  getPatientMedications,
  getPatientTests,

  // Encounter operations
  getEncounters,
  getEncounter,
  createEncounter,

  // Appointment operations
  listAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,

  // AI operations
  aiEmrExtract,
  aiCreatePatient,

  // Drug interactions
  getDrugInteractions,
};
