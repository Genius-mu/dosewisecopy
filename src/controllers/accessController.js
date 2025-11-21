const AccessGrant = require('../models/AccessGrant');
const PatientUser = require('../models/PatientUser');
const { generateQRCode, decodeQRCode } = require('../services/qrService');

/**
 * @desc    Generate QR code for patient access
 * @route   POST /api/access/generate-qr
 * @access  Private (Patient)
 */
const generateQR = async (req, res, next) => {
  try {
    const { clinicId } = req.body;

    if (!clinicId) {
      res.status(400);
      throw new Error('Please provide clinic ID');
    }

    // Generate QR code
    const { code, qrDataUrl, expiresAt } = await generateQRCode();

    // Create access grant
    const accessGrant = await AccessGrant.create({
      patientId: req.user._id,
      clinicId,
      code,
      expiresAt,
    });

    res.status(201).json({
      success: true,
      data: {
        accessGrant,
        qrCode: qrDataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Scan QR code and get patient access
 * @route   GET /api/access/scan/:code
 * @access  Private (Clinic)
 */
const scanQR = async (req, res, next) => {
  try {
    const { code } = req.params;

    // Decode and validate QR code
    const decodedCode = decodeQRCode(code);

    // Find access grant
    const accessGrant = await AccessGrant.findOne({ code: decodedCode })
      .populate('patientId', 'name email dob dorraPatientId')
      .populate('clinicId', 'name hospital');

    if (!accessGrant) {
      res.status(404);
      throw new Error('Access grant not found');
    }

    // Check if expired
    if (new Date() > accessGrant.expiresAt) {
      res.status(403);
      throw new Error('QR code has expired');
    }

    // Check if active
    if (!accessGrant.isActive) {
      res.status(403);
      throw new Error('Access grant has been revoked');
    }

    // Verify clinic matches
    if (accessGrant.clinicId._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('This QR code is not for your clinic');
    }

    res.json({
      success: true,
      data: {
        patient: accessGrant.patientId,
        accessGrant: {
          _id: accessGrant._id,
          expiresAt: accessGrant.expiresAt,
          createdAt: accessGrant.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke access grant
 * @route   DELETE /api/access/revoke/:grantId
 * @access  Private (Patient)
 */
const revokeAccess = async (req, res, next) => {
  try {
    const { grantId } = req.params;

    const accessGrant = await AccessGrant.findById(grantId);

    if (!accessGrant) {
      res.status(404);
      throw new Error('Access grant not found');
    }

    // Verify patient owns this grant
    if (accessGrant.patientId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to revoke this access');
    }

    accessGrant.isActive = false;
    await accessGrant.save();

    res.json({
      success: true,
      message: 'Access grant revoked successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQR,
  scanQR,
  revokeAccess,
};

