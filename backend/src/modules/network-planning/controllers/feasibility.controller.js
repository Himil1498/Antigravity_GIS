const asyncHandler = require('../../../shared/utils/asyncHandler');
const AppError = require('../../../shared/utils/AppError');
const feasibilityService = require('../services/feasibility.service');
const xlsx = require('xlsx');
const togeojson = require('@mapbox/togeojson');
const { DOMParser } = require('@xmldom/xmldom');
const { v4: uuidv4 } = require('uuid');
const AdmZip = require('adm-zip');

const parseCoordinatesFromExcel = (buffer) => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  if (!data || data.length === 0) return [];

  // Auto-detect coordinate columns (case insensitive)
  const keys = Object.keys(data[0]);
  const latKey = keys.find(k => /^(lat|latitude|y)$/i.test(k.trim()));
  const lngKey = keys.find(k => /^(lng|lon|longitude|x)$/i.test(k.trim()));

  if (!latKey || !lngKey) {
    throw new AppError('Could not auto-detect Latitude and Longitude columns. Please ensure columns are named "Lat", "Lng", "Latitude", or "Longitude".', 400);
  }

  return data.map((row, index) => ({
    uid: uuidv4(),
    originalIndex: index,
    lat: parseFloat(row[latKey]),
    lng: parseFloat(row[lngKey]),
    ...row // Keep original data for export
  })).filter(row => !isNaN(row.lat) && !isNaN(row.lng));
};

const parseCoordinatesFromKML = (buffer) => {
  const kmlString = buffer.toString('utf8');
  const dom = new DOMParser().parseFromString(kmlString, 'text/xml');
  const geojson = togeojson.kml(dom);

  if (!geojson || !geojson.features) return [];

  return geojson.features
    .filter(f => f.geometry && f.geometry.type === 'Point')
    .map((f, index) => ({
      uid: uuidv4(),
      originalIndex: index,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      name: f.properties?.name || `Point ${index + 1}`,
      description: f.properties?.description || ''
    }));
};

const parseCoordinatesFromKMZ = (buffer) => {
  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();
  
  const kmlEntry = zipEntries.find(entry => entry.entryName.toLowerCase().endsWith('.kml'));
  
  if (!kmlEntry) {
    throw new AppError('No KML file found inside the KMZ archive', 400);
  }
  
  const kmlBuffer = kmlEntry.getData();
  return parseCoordinatesFromKML(kmlBuffer);
};

const { prisma } = require('../../../config/database');

exports.getInfraFolders = asyncHandler(async (req, res, next) => {
  const folders = await prisma.$queryRawUnsafe(`
    SELECT id, name FROM network_folders
    WHERE deleted_at IS NULL
    ORDER BY name ASC
  `);
  res.status(200).json({ success: true, data: folders });
});

exports.checkBulkFeasibility = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const { infraType, regionIds, maxDistance, infraFolderId } = req.body;
  if (!infraType) {
    throw new AppError('Infrastructure type (infraType) is required', 400);
  }

  let parsedRegionIds = [];
  if (regionIds) {
    try {
      parsedRegionIds = JSON.parse(regionIds);
    } catch (e) {
      throw new AppError('Invalid regionIds format', 400);
    }
  }
  
  const parsedFolderId = infraFolderId ? parseInt(infraFolderId, 10) : null;

  const extension = req.file.originalname.split('.').pop().toLowerCase();
  let locations = [];

  try {
    if (['xlsx', 'xls', 'csv'].includes(extension)) {
      locations = parseCoordinatesFromExcel(req.file.buffer);
    } else if (['kml'].includes(extension)) {
      locations = parseCoordinatesFromKML(req.file.buffer);
    } else if (['kmz'].includes(extension)) {
      locations = parseCoordinatesFromKMZ(req.file.buffer);
    } else {
      throw new AppError('Unsupported file format. Please upload Excel, KML, or KMZ.', 400);
    }
  } catch (error) {
    throw new AppError(`Failed to parse file: ${error.message}`, 400);
  }

  if (locations.length === 0) {
    throw new AppError('No valid coordinates found in the uploaded file.', 400);
  }

  if (locations.length > 10000) {
    throw new AppError('Maximum limit of 10,000 locations per file exceeded.', 400);
  }

  const maxDistMeters = maxDistance ? parseInt(maxDistance) : 20000;
  const results = await feasibilityService.checkBulkFeasibility(locations, infraType, parsedRegionIds, maxDistMeters, parsedFolderId);

  res.status(200).json({
    success: true,
    data: {
      total_processed: results.length,
      feasible_count: results.filter(r => r.is_feasible).length,
      unfeasible_count: results.filter(r => !r.is_feasible).length,
      results
    }
  });
});
