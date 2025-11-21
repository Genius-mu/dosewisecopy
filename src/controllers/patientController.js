const PatientUser = require("../models/PatientUser");
const SymptomLog = require("../models/SymptomLog");
const Encounter = require("../models/Encounter");
const { getEncounters, aiEmrExtract } = require("../services/dorraService");

/**
 * @desc    Get current patient profile
 * @route   GET /api/patient/me
 * @access  Private (Patient)
 */
const getMe = async (req, res, next) => {
  try {
    const patient = await PatientUser.findById(req.user._id);

    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get patient medical records from Dorra EMR
 * @route   GET /api/patient/records
 * @access  Private (Patient)
 */
const getRecords = async (req, res, next) => {
  try {
    const patient = await PatientUser.findById(req.user._id);

    if (!patient.dorraPatientId) {
      res.status(404);
      throw new Error(
        "No Dorra patient ID found. Please link your account with Dorra EMR."
      );
    }

    // Fetch encounters from Dorra EMR
    const dorraEncounters = await getEncounters(patient.dorraPatientId);

    // Also fetch local encounters
    const localEncounters = await Encounter.find({
      patientId: patient._id,
    }).sort({ encounterDate: -1 });

    res.json({
      success: true,
      data: {
        dorraRecords: dorraEncounters,
        localRecords: localEncounters,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload and extract medical record using AI
 * @route   POST /api/patient/upload-record
 * @access  Private (Patient)
 */
const uploadRecord = async (req, res, next) => {
  try {
    const { recordText } = req.body;

    if (!recordText) {
      res.status(400);
      throw new Error("Please provide medical record text");
    }

    // Check if patient has Dorra ID
    if (!req.user.dorraPatientId) {
      res.status(400);
      throw new Error(
        "Patient must be synced to Dorra EMR to use AI extraction. Please contact support."
      );
    }

    // Extract structured data using Dorra AI EMR
    const extractedData = await aiEmrExtract(
      recordText,
      req.user.dorraPatientId
    );

    // The Dorra AI EMR endpoint returns the created resource (Appointment or Encounter)
    // Save a reference to local database
    let encounter = null;

    if (extractedData.resource === "Encounter" && extractedData.data) {
      // Create local encounter record
      encounter = await Encounter.create({
        patientId: req.user._id,
        dorraEncounterId: extractedData.data.id || null,
        summary: extractedData.data.chief_complaint || "",
        symptoms: extractedData.data.symptoms || [],
        diagnosis: extractedData.data.diagnosis || "",
        medications: extractedData.data.medications || [],
        vitals: extractedData.data.vitals || {},
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
 * @desc    Log a symptom
 * @route   POST /api/patient/symptom
 * @access  Private (Patient)
 */
const logSymptom = async (req, res, next) => {
  try {
    const { symptom, severity, notes } = req.body;

    if (!symptom) {
      res.status(400);
      throw new Error("Please provide symptom description");
    }

    const symptomLog = await SymptomLog.create({
      patientId: req.user._id,
      symptom,
      severity: severity || "moderate",
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      data: symptomLog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get patient symptom logs
 * @route   GET /api/patient/symptoms
 * @access  Private (Patient)
 */
const getSymptoms = async (req, res, next) => {
  try {
    const symptoms = await SymptomLog.find({ patientId: req.user._id }).sort({
      loggedAt: -1,
    });

    res.json({
      success: true,
      data: symptoms,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  getRecords,
  uploadRecord,
  logSymptom,
  getSymptoms,
};
