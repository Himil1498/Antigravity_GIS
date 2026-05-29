/**
 * DataHub Constants
 */

const DATA_TYPES = {
  INFRASTRUCTURE: "infrastructure",
  MEASUREMENTS: "distance",
  POLYGONS: "polygon",
  CIRCLES: "circle",
  ELEVATIONS: "elevation",
  SECTORS: "sector",
  LAYERS: "layers",
};

const EXPORT_FORMATS = {
  JSON: "json",
  GEOJSON: "geojson",
  KML: "kml",
  CSV: "csv",
};

const DEFAULTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  EXPORT_EXPIRY_DAYS: 7,
};

module.exports = {
  DATA_TYPES,
  EXPORT_FORMATS,
  DEFAULTS,
};
