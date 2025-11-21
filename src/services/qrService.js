const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { QR_EXPIRY_HOURS } = require('../config/constants');

/**
 * Generate a unique QR code for patient access
 */
const generateQRCode = async (accessGrantData) => {
  try {
    // Generate unique code
    const code = uuidv4();

    // Create QR code data URL
    const qrDataUrl = await QRCode.toDataURL(code);

    return {
      code,
      qrDataUrl,
      expiresAt: new Date(Date.now() + QR_EXPIRY_HOURS * 60 * 60 * 1000),
    };
  } catch (error) {
    console.error('QR Generation Error:', error.message);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Decode QR code (in this case, just validate the code format)
 */
const decodeQRCode = (code) => {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(code)) {
      throw new Error('Invalid QR code format');
    }
    return code;
  } catch (error) {
    throw new Error('Failed to decode QR code');
  }
};

module.exports = {
  generateQRCode,
  decodeQRCode,
};

