const { getDrugInteractions } = require('../services/dorraService');

/**
 * @desc    Check drug interactions
 * @route   POST /api/drugs/interactions
 * @access  Private
 */
const checkInteractions = async (req, res, next) => {
  try {
    const { medications } = req.body;

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      res.status(400);
      throw new Error('Please provide an array of medications');
    }

    if (medications.length < 2) {
      return res.json({
        success: true,
        message: 'At least 2 medications required to check interactions',
        data: {
          medications,
          interactions: [],
          severity: 'none',
          recommendations: ['Single medication - no interactions to check'],
        },
      });
    }

    // Check drug interactions using Dorra PharmaVigilance API
    const interactionData = await getDrugInteractions(medications);

    res.json({
      success: true,
      data: interactionData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkInteractions,
};

