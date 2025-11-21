const mongoose = require('mongoose');

const encounterSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientUser',
      required: true,
    },
    dorraEncounterId: {
      type: String,
      default: null,
    },
    summary: {
      type: String,
      default: '',
    },
    symptoms: [
      {
        type: String,
      },
    ],
    diagnosis: {
      type: String,
      default: '',
    },
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
      },
    ],
    vitals: {
      bloodPressure: String,
      heartRate: String,
      temperature: String,
      weight: String,
      height: String,
    },
    encounterDate: {
      type: Date,
      default: Date.now,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClinicUser',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster patient lookups
encounterSchema.index({ patientId: 1, encounterDate: -1 });

module.exports = mongoose.model('Encounter', encounterSchema);

