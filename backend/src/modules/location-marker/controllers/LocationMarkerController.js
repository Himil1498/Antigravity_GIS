const locationMarkerService = require('../services/LocationMarkerService');

exports.getAllMarkers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const onlyFeasibility = req.query.onlyFeasibility === 'true';
    const markers = await locationMarkerService.getAllMarkers(userId, onlyFeasibility);
    res.json({ success: true, data: markers });
  } catch (error) {
    next(error);
  }
};

exports.createMarker = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const marker = await locationMarkerService.createMarker(userId, req.body);
    res.status(201).json({ success: true, data: marker });
  } catch (error) {
    next(error);
  }
};

exports.createBulkMarkers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const markers = await locationMarkerService.createBulkMarkers(userId, req.body.markers);
    res.status(201).json({ success: true, data: markers, count: markers.length });
  } catch (error) {
    next(error);
  }
};

exports.updateFeasibility = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const { feasibilityData, linkedFileId } = req.body;
        const updated = await locationMarkerService.updateMarkerFeasibility(id, userId, feasibilityData, linkedFileId);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Marker not found or unauthorized' });
        }
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

exports.updateMarker = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    // Map remarks to notes since DB schema uses 'notes'
    const markerData = {
      name: req.body.name,
      notes: req.body.remarks || req.body.notes
    };
    const updated = await locationMarkerService.updateMarkerBaseFields(id, userId, markerData);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Marker not found or unauthorized' });
    }
    // Transform 'notes' to 'remarks' for frontend consistency
    updated.remarks = updated.notes;
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteMarker = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const deleted = await locationMarkerService.deleteMarker(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Marker not found or unauthorized' });
    }
    res.json({ success: true, message: 'Marker deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteBulkMarkers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing ids array' });
    }
    const count = await locationMarkerService.deleteBulkMarkers(userId, ids);
    res.json({ success: true, message: `Deleted ${count} markers successfully`, count });
  } catch (error) {
    next(error);
  }
};
