const mongoose = require('mongoose');

const symptomLogSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientUser',
      required: true,
    },
    symptom: {
      type: String,
      required: [true, 'Please provide symptom description'],
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate',
    },
    notes: {
      type: String,
      default: '',
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster patient lookups
symptomLogSchema.index({ patientId: 1, loggedAt: -1 });

module.exports = mongoose.model('SymptomLog', symptomLogSchema);

