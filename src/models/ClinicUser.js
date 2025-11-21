const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const clinicUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    hospital: {
      type: String,
      required: [true, 'Please provide hospital name'],
      trim: true,
    },
    userType: {
      type: String,
      default: 'clinic',
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
clinicUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
clinicUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('ClinicUser', clinicUserSchema);

