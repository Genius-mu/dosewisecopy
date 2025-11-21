const PatientUser = require("../models/PatientUser");
const Encounter = require("../models/Encounter");
const { aiEmrExtract, aiCreatePatient } = require("../services/dorraService");

/**
 * @desc    Extract EMR data using AI
 * @route   POST /api/ai/emr
 * @access  Private
 */
const extractEmr = async (req, res, next) => {
  try {
    const { text, patientId } = req.body;

    if (!text) {
      res.status(400);
      throw new Error("Please provide EMR text to extract");
    }

    if (!patientId) {
      res.status(400);
      throw new Error("Please provide patient ID");
    }

    // Get patient to retrieve Dorra ID
    const patient = await PatientUser.findById(patientId);
    if (!patient) {
      res.status(404);
      throw new Error("Patient not found");
    }

    if (!patient.dorraPatientId) {
      res.status(400);
      throw new Error(
        "Patient must be synced to Dorra EMR to use AI extraction"
      );
    }

    // Call Dorra AI EMR extraction with prompt and patient Dorra ID
    const extractedData = await aiEmrExtract(text, patient.dorraPatientId);

    // The Dorra AI EMR endpoint creates the resource (Appointment or Encounter)
    // Save a reference to local database
    let encounter = null;

    if (extractedData.resource === "Encounter" && extractedData.data) {
      encounter = await Encounter.create({
        patientId,
        dorraEncounterId: extractedData.data.id || null,
        summary: extractedData.data.chief_complaint || "",
        symptoms: extractedData.data.symptoms || [],
        diagnosis: extractedData.data.diagnosis || "",
        medications: extractedData.data.medications || [],
        vitals: extractedData.data.vitals || {},
        clinicId: req.user.userType === "clinic" ? req.user._id : null,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        resource: extractedData.resource,
        dorraResponse: extractedData,
        savedEncounter: encounter,
      },
      message: `AI successfully created ${extractedData.resource} in Dorra EMR`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create patient using AI
 * @route   POST /api/ai/patient
 * @access  Private (Clinic)
 */
const createPatientAI = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400);
      throw new Error("Please provide patient information text");
    }

    // Call Dorra AI patient creation
    const aiPatientData = await aiCreatePatient(text);

    // Create patient in local database
    // Note: AI-created patients won't have passwords, so they can't log in
    // This is for clinic record-keeping purposes
    const patient = await PatientUser.create({
      name: aiPatientData.name || "Unknown",
      email: aiPatientData.email || `patient_${Date.now()}@dosewise.local`,
      password: Math.random().toString(36).slice(-8), // Random password
      dob: aiPatientData.dob || new Date(),
      dorraPatientId: aiPatientData.id || aiPatientData._id || null,
    });

    res.status(201).json({
      success: true,
      data: {
        aiExtractedData: aiPatientData,
        createdPatient: patient,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  extractEmr,
  createPatientAI,
};
