const boundaryImpactService = require('./boundary-impact.service');

const analyzeImpact = async (req, res) => {
  try {
    const { id: regionId } = req.params;
    const result = await boundaryImpactService.analyzeImpact(regionId);
    res.json(result);
  } catch (error) {
    console.error('Analyze boundary impact error:', error);
    const status = error.message === 'No draft boundary found' ? 404 : 500;
    res.status(status).json({
      success: false,
      error: 'Failed to analyze boundary impact',
      details: error.message
    });
  }
};

const getInfrastructureHistory = async (req, res) => {
  try {
    const { id: regionId } = req.params;
    const { limit, offset } = req.query;

    const { history, total } = await boundaryImpactService.getInfrastructureHistory(
      regionId,
      limit,
      offset
    );

    res.json({
      success: true,
      history, // Note: formatting handled in frontend or can be added to service transform
      total,
      limit: parseInt(limit) || 10,
      offset: parseInt(offset) || 0
    });
  } catch (error) {
    console.error('Get infrastructure history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get infrastructure history'
    });
  }
};

module.exports = {
  analyzeImpact,
  getInfrastructureHistory
};
