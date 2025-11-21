const mongoose = require('mongoose');

const accessGrantSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientUser',
      required: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClinicUser',
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
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
accessGrantSchema.index({ code: 1 });
accessGrantSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('AccessGrant', accessGrantSchema);

