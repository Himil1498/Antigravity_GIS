const boundaryPublicService = require("./boundary-public.service");

const getAllPublishedBoundaries = async (req, res) => {
  try {
    const boundaries = await boundaryPublicService.getPublishedBoundaries(
      req.user.id,
      req.user.role,
    );

    // Transform to frontend-friendly format (if needed, but service returns array)
    // The original controller mapped with formatBoundary from utils.
    // We can do a lightweight map here or assume the service return is sufficient.
    // Looking at service implementation, it returns raw DB rows.
    // Let's do the simple formatting here to match original response structure.

    // Original formatBoundary util was simple:
    const formatted = boundaries.map((b) => ({
      id: b.id,
      regionId: b.regionId || b.id || b.regionid, // Handles both alias and raw column
      regionName: b.regionName || b.name || b.regionname,
      boundaryGeoJSON:
        b.boundaryGeoJSON || b.boundary_geojson || b.boundarygeojson,
      boundaryType: b.boundaryType || b.boundary_type || b.boundarytype,
      vertexCount: b.vertexCount || b.vertex_count || b.vertexcount,
      area: b.areaSqKm || b.area_sqkm || b.areasqkm,
      versionNumber: b.versionNumber || b.version_number || b.versionnumber,
      publishedAt: b.publishedAt || b.published_at || b.publishedat,
    }));

    res.json({
      success: true,
      count: formatted.length,
      boundaries: formatted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching published boundaries:", error);
    res.status(500).json({
      success: false,
      error: boundaryPublicService.ERRORS.FAILED_TO_FETCH,
      details: error.message,
    });
  }
};

module.exports = {
  getAllPublishedBoundaries,
};
