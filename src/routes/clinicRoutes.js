const express = require("express");
const {
  getPatientInfo,
  createNewEncounter,
  getEncounterById,
  checkPrescription,
} = require("../controllers/clinicController");
const { protect, clinicOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication and clinic role
router.use(protect);
router.use(clinicOnly);

router.get("/patient/:id", getPatientInfo);
router.post("/encounter", createNewEncounter);
router.get("/encounter/:id", getEncounterById);
router.post("/prescription/check", checkPrescription);

module.exports = router;
