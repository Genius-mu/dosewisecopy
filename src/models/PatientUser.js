const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const patientUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    dob: {
      type: Date,
      required: [true, "Please provide date of birth"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    allergies: {
      type: [String],
      default: [],
    },
    dorraPatientId: {
      type: String,
      default: null,
    },
    userType: {
      type: String,
      default: "patient",
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
patientUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
patientUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("PatientUser", patientUserSchema);
