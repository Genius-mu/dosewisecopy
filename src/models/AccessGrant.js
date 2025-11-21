const mongoose = require("mongoose");

const accessGrantSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientUser",
      required: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClinicUser",
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true, // This creates an index automatically, no need for schema.index()
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
// Note: 'code' field already has unique index from schema definition
accessGrantSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("AccessGrant", accessGrantSchema);
