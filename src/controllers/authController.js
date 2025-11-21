const jwt = require("jsonwebtoken");
const PatientUser = require("../models/PatientUser");
const ClinicUser = require("../models/ClinicUser");
const { createPatient } = require("../services/dorraService");

// Generate JWT Token
const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * @desc    Register a new patient
 * @route   POST /api/auth/patient/register
 * @access  Public
 */
const registerPatient = async (req, res, next) => {
  try {
    const { name, email, password, dob, gender, phone, address, allergies } =
      req.body;

    // Validate input
    if (!name || !email || !password || !dob) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    // Check if user already exists
    const userExists = await PatientUser.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("Patient already exists with this email");
    }

    // Create patient locally
    const patient = await PatientUser.create({
      name,
      email,
      password,
      dob,
      gender: gender || "Male",
      phone: phone || "",
      address: address || "",
      allergies: allergies || [],
    });

    // Sync with Dorra EMR
    let dorraPatientId = null;
    try {
      const dorraResponse = await createPatient({
        name: patient.name,
        email: patient.email,
        dob: patient.dob,
        gender: patient.gender,
        phone: patient.phone,
        address: patient.address,
        allergies: patient.allergies,
      });

      // Save Dorra patient ID if successful
      if (dorraResponse && dorraResponse.id) {
        dorraPatientId = dorraResponse.id.toString();
        patient.dorraPatientId = dorraPatientId;
        await patient.save();
      }
    } catch (dorraError) {
      // Log error but don't fail registration
      console.error(
        "Failed to sync patient with Dorra EMR:",
        dorraError.message
      );
    }

    if (patient) {
      res.status(201).json({
        success: true,
        data: {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          dob: patient.dob,
          gender: patient.gender,
          phone: patient.phone,
          address: patient.address,
          allergies: patient.allergies,
          dorraPatientId: dorraPatientId,
          userType: patient.userType,
          token: generateToken(patient._id, patient.userType),
        },
        message: dorraPatientId
          ? "Patient registered and synced with Dorra EMR"
          : "Patient registered locally (Dorra EMR sync failed)",
      });
    } else {
      res.status(400);
      throw new Error("Invalid patient data");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new clinic
 * @route   POST /api/auth/clinic/register
 * @access  Public
 */
const registerClinic = async (req, res, next) => {
  try {
    const { name, email, password, hospital } = req.body;

    // Validate input
    if (!name || !email || !password || !hospital) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    // Check if user already exists
    const userExists = await ClinicUser.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("Clinic already exists with this email");
    }

    // Create clinic
    const clinic = await ClinicUser.create({
      name,
      email,
      password,
      hospital,
    });

    if (clinic) {
      res.status(201).json({
        success: true,
        data: {
          _id: clinic._id,
          name: clinic.name,
          email: clinic.email,
          hospital: clinic.hospital,
          userType: clinic.userType,
          token: generateToken(clinic._id, clinic.userType),
        },
      });
    } else {
      res.status(400);
      throw new Error("Invalid clinic data");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user (patient or clinic)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password, userType } = req.body;

    // Validate input
    if (!email || !password || !userType) {
      res.status(400);
      throw new Error("Please provide email, password, and userType");
    }

    let user;
    if (userType === "patient") {
      user = await PatientUser.findOne({ email }).select("+password");
    } else if (userType === "clinic") {
      user = await ClinicUser.findOne({ email }).select("+password");
    } else {
      res.status(400);
      throw new Error("Invalid user type");
    }

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      const responseData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        token: generateToken(user._id, user.userType),
      };

      if (userType === "patient") {
        responseData.dob = user.dob;
        responseData.dorraPatientId = user.dorraPatientId;
      } else {
        responseData.hospital = user.hospital;
      }

      res.json({
        success: true,
        data: responseData,
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerPatient,
  registerClinic,
  login,
};
