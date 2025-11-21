const PatientUser = require("../models/PatientUser");
const Encounter = require("../models/Encounter");
const {
  getPatient,
  getEncounter,
  createEncounter,
  getDrugInteractions,
} = require("../services/dorraService");

/**
 * @desc    Get patient information
 * @route   GET /api/clinic/patient/:id
 * @access  Private (Clinic)
 */
const getPatientInfo = async (req, res, next) => {
  try {
    const { id } = req.params;

    // First check local database
    const localPatient = await PatientUser.findById(id);

    if (!localPatient) {
      res.status(404);
      throw new Error("Patient not found in local database");
    }

    let dorraPatientData = null;

    // If patient has Dorra ID, fetch from Dorra EMR
    if (localPatient.dorraPatientId) {
      try {
        dorraPatientData = await getPatient(localPatient.dorraPatientId);
      } catch (error) {
        console.error("Error fetching from Dorra:", error.message);
        // Continue even if Dorra fetch fails
      }
    }

    // Fetch local encounters
    const encounters = await Encounter.find({ patientId: id }).sort({
      encounterDate: -1,
    });

    res.json({
      success: true,
      data: {
        localPatient,
        dorraPatient: dorraPatientData,
        encounters,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new encounter
 * @route   POST /api/clinic/encounter
 * @access  Private (Clinic)
 */
const createNewEncounter = async (req, res, next) => {
  try {
    const { patientId, summary, symptoms, diagnosis, medications, vitals } =
      req.body;

    if (!patientId) {
      res.status(400);
      throw new Error("Please provide patient ID");
    }

    // Verify patient exists
    const patient = await PatientUser.findById(patientId);
    if (!patient) {
      res.status(404);
      throw new Error("Patient not found");
    }

    // Create local encounter
    const encounter = await Encounter.create({
      patientId,
      summary: summary || "",
      symptoms: symptoms || [],
      diagnosis: diagnosis || "",
      medications: medications || [],
      vitals: vitals || {},
      clinicId: req.user._id,
    });

    // If patient has Dorra ID, also create in Dorra EMR
    let dorraEncounter = null;
    if (patient.dorraPatientId) {
      try {
        dorraEncounter = await createEncounter({
          patientId: patient.dorraPatientId,
          summary,
          symptoms,
          diagnosis,
          medications,
          vitals,
        });

        // Update local encounter with Dorra ID
        encounter.dorraEncounterId = dorraEncounter.id || dorraEncounter._id;
        await encounter.save();
      } catch (error) {
        console.error("Error creating encounter in Dorra:", error.message);
        // Continue even if Dorra creation fails
      }
    }

    res.status(201).json({
      success: true,
      data: {
        localEncounter: encounter,
        dorraEncounter,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get encounter by ID with drug interactions
 * @route   GET /api/clinic/encounter/:id
 * @access  Private (Clinic)
 */
const getEncounterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch encounter from Dorra EMR (includes drug_interactions field)
    const encounterData = await getEncounter(id);

    res.json({
      success: true,
      data: encounterData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check prescription for drug interactions
 * @route   POST /api/clinic/prescription/check
 * @access  Private (Clinic)
 */
const checkPrescription = async (req, res, next) => {
  try {
    const { medications } = req.body;

    if (
      !medications ||
      !Array.isArray(medications) ||
      medications.length === 0
    ) {
      res.status(400);
      throw new Error("Please provide an array of medications");
    }

    // Check drug interactions using Dorra PharmaVigilance API
    const interactionData = await getDrugInteractions(medications);

    res.json({
      success: true,
      data: interactionData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientInfo,
  createNewEncounter,
  getEncounterById,
  checkPrescription,
};
