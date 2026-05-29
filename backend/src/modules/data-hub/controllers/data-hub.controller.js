const dataHubService = require("../services/data-hub.service");
const {
  transformDistanceMeasurements,
  validateDataType,
  getUserIdColumn,
} = require("../utils");
const { DATA_TYPES } = require("../constants");
const { logAudit } = require("../../audit/audit.service");
const { pool } = require("../../../config/database");
const xlsx = require('xlsx');

// Constants for controller
const ERRORS = {
  FAILED_TO_GET_DATA: "Failed to fetch data",
  FAILED_TO_DELETE: "Failed to delete item",
  FAILED_TO_BULK_DELETE: "Failed to bulk delete items",
  ITEM_NOT_FOUND: "Item not found",
  PERMISSION_DENIED: "Permission denied",
  INVALID_EXPORT_TYPE: "Invalid export type",
  INVALID_EXPORT_SCOPE: "Invalid export scope",
  EXPORT_PARAMS_REQUIRED: "Export parameters required",
  IMPORT_PARAMS_REQUIRED: "Import parameters required",
  FAILED_TO_EXPORT: "Failed to export data",
  FAILED_TO_IMPORT: "Failed to import data",
  FAILED_TO_GET_EXPORTS: "Failed to fetch exports",
  FAILED_TO_GET_IMPORTS: "Failed to fetch imports",
  EXPORT_NOT_FOUND: "Export not found",
  FAILED_TO_DOWNLOAD: "Failed to download file",
};

const MESSAGES = {
  DELETE_SUCCESS: "Item deleted successfully",
  BULK_DELETE_SUCCESS: "Successfully deleted {count} {type} items",
  EXPORT_STARTED: "Export started",
  IMPORT_COMING_SOON: "Import functionality coming soon",
};

const getAllData = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = (req.user.role || "").toLowerCase();
    const { filter, userId: filterUserId, limit = 100 } = req.query;

    // Build WHERE condition (simplified inline logic from legacy utils)
    let whereCondition = "";
    let whereParams = [];

    if (
      filter === "all" &&
      (currentUserRole === "admin" || currentUserRole === "manager")
    ) {
      // No filter, fetch all (admins only)
    } else if (
      filter === "user" &&
      (currentUserRole === "admin" || currentUserRole === "manager") &&
      filterUserId
    ) {
      whereCondition = "WHERE created_by = ?";
      whereParams = [parseInt(filterUserId)];
    } else {
      // Default: fetch own data
      whereCondition = "WHERE created_by = ?";
      whereParams = [currentUserId];
    }

    const data = await dataHubService.fetchAllUserData(
      whereCondition,
      whereParams,
      limit,
    );

    const distances = transformDistanceMeasurements(data.distancesRaw);

    res.json({
      success: true,
      data: {
        distances,
        polygons: data.polygons,
        circles: data.circles,
        elevations: data.elevations,
        infrastructures: data.infrastructures,
        sectors: data.sectors,
      },
      totalCount:
        distances.length +
        data.polygons.length +
        data.circles.length +
        data.elevations.length +
        data.infrastructures.length +
        data.sectors.length,
    });
  } catch (error) {
    console.error("Get all data error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_GET_DATA });
  }
};

const deleteSingleData = async (req, res) => {
  try {
    const { type, id } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = (req.user.role || "").toLowerCase();

    const validation = validateDataType(type);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const tableName = validation.tableName;
    const userIdColumn = getUserIdColumn(type);

    const { exists, ownerId } = await dataHubService.checkItemOwnership(
      tableName,
      id,
      userIdColumn,
    );

    if (!exists) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.ITEM_NOT_FOUND });
    }

    if (currentUserRole !== "admin" && ownerId !== currentUserId) {
      return res
        .status(403)
        .json({ success: false, error: ERRORS.PERMISSION_DENIED });
    }

    await dataHubService.deleteSingleItem(tableName, id);

    try {
      await logAudit(
        currentUserId,
        "Deleted data hub item",
        "DATA_ITEM_DELETE",
        id,
        { type: type, tableName: tableName },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.json({ success: true, message: MESSAGES.DELETE_SUCCESS });
  } catch (error) {
    console.error("Delete single data error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_DELETE });
  }
};

const deleteBulkData = async (req, res) => {
  try {
    const { type } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.id;
    const currentUserRole = (req.user.role || "").toLowerCase();

    const validation = validateDataType(type);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const tableName = validation.tableName;
    const userIdColumn = getUserIdColumn(type);

    let whereCondition = `WHERE ${userIdColumn} = ?`;
    let whereParams = [];

    if (userId && currentUserRole === "admin") {
      whereParams = [userId];
    } else if (currentUserRole === "admin" && !userId) {
      whereCondition = ""; // Delete All
      whereParams = [];
    } else {
      whereParams = [currentUserId];
    }

    const count = await dataHubService.getDeleteCount(
      tableName,
      whereCondition,
      whereParams,
    );
    await dataHubService.deleteBulkItems(
      tableName,
      whereCondition,
      whereParams,
    );

    try {
      await logAudit(
        currentUserId,
        "Bulk deleted data hub items",
        "DATA_ITEM_BULK_DELETE",
        0,
        { type: type, count: count },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.json({
      success: true,
      message: MESSAGES.BULK_DELETE_SUCCESS.replace("{count}", count).replace(
        "{type}",
        type,
      ),
      deletedCount: count,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.FAILED_TO_BULK_DELETE });
  }
};

// --- Imports/Exports Placeholder Handlers ---

const importData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, region_id } = req.body;
    
    if (!req.file || !type) {
      return res.status(400).json({ success: false, error: 'File and type are required' });
    }

    const validation = validateDataType(type);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({ success: false, error: 'File is empty' });
    }

    let insertQuery = '';
    const values = [];

    // Map each row to a bulk insert tuple depending on type schema
    switch (type) {
      case 'distance':
        insertQuery = 'INSERT INTO distance_measurements (created_by, region_id, measurement_name, start_lat, start_lng, end_lat, end_lng, distance_meters, properties) VALUES ?';
        rawData.forEach(row => {
           let parsedPoints = [];
           try { parsedPoints = JSON.parse(row.points_json || '[]'); } catch(e) {}
           let startLat = parsedPoints.length > 0 ? parsedPoints[0].lat : 0;
           let startLng = parsedPoints.length > 0 ? parsedPoints[0].lng : 0;
           let endLat = parsedPoints.length > 0 ? parsedPoints[parsedPoints.length - 1].lat : 0;
           let endLng = parsedPoints.length > 0 ? parsedPoints[parsedPoints.length - 1].lng : 0;
           values.push([userId, region_id || null, row.name || 'Imported Line', startLat, startLng, endLat, endLng, parseFloat(row.path_distance_m || row.total_distance_m) || 0, JSON.stringify(parsedPoints)]);
        });
        break;
      case 'polygon':
        insertQuery = 'INSERT INTO polygon_drawings (created_by, region_id, polygon_name, area, coordinates) VALUES ?';
        rawData.forEach(row => {
           let parsedCoords = [];
           try { parsedCoords = JSON.parse(row.coordinates_json || '[]'); } catch(e) {}
           values.push([userId, region_id || null, row.name || 'Imported Polygon', parseFloat(row.area_sqm) || 0, JSON.stringify(parsedCoords)]);
        });
        break;
      case 'circle':
        insertQuery = 'INSERT INTO circle_drawings (created_by, region_id, circle_name, center_lat, center_lng, radius_meters) VALUES ?';
        rawData.forEach(row => {
           values.push([userId, region_id || null, row.name || 'Imported Circle', parseFloat(row.center_lat), parseFloat(row.center_lng), parseFloat(row.radius_m)]);
        });
        break;
      case 'sector':
        insertQuery = 'INSERT INTO sector_rf_data (user_id, region_id, sector_name, tower_lat, tower_lng, radius, azimuth, beamwidth, frequency) VALUES ?';
        rawData.forEach(row => {
           values.push([userId, region_id || null, row.name || 'Imported Sector', parseFloat(row.tower_lat || row.center_lat), parseFloat(row.tower_lng || row.center_lng), parseFloat(row.radius_m || row.radius), parseFloat(row.azimuth_deg || row.start_angle) || 0, parseFloat(row.beamwidth_deg || row.end_angle) || 65, row.frequency_mhz || row.frequency || null]);
        });
        break;
      case 'elevation':
        insertQuery = 'INSERT INTO elevation_profiles (created_by, region_id, profile_name, total_distance, max_elevation, min_elevation, elevation_data, path_coordinates) VALUES ?';
        rawData.forEach(row => {
           let parsedData = [];
           try { parsedData = JSON.parse(row.elevation_data_json || '[]'); } catch(e) {}
           values.push([userId, region_id || null, row.name || 'Imported Elevation', parseFloat(row.path_distance_m || row.total_distance_m) || 0, parseFloat(row.max_elevation_m) || 0, parseFloat(row.min_elevation_m) || 0, JSON.stringify(parsedData), JSON.stringify([])]);
        });
        break;
    }

    if (values.length > 0) {
       const flatValues = [];
       const valueStrings = [];
       let paramIndex = 1;
       values.forEach(row => {
         const rowParams = [];
         row.forEach(val => {
            rowParams.push(`$${paramIndex++}`);
            flatValues.push(val);
         });
         valueStrings.push(`(${rowParams.join(', ')})`);
       });
       const finalQuery = insertQuery.replace('VALUES ?', 'VALUES ') + valueStrings.join(', ');
       await pool.query(finalQuery, flatValues);
    }

    try {
      await logAudit(
        userId,
        `Imported Data Hub file: ${req.file.originalname}`,
        "DATA_IMPORTED",
        0,
        { type, count: values.length, filename: req.file.originalname },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.status(201).json({ success: true, message: `Successfully imported ${values.length} records.`, importedCount: values.length });
  } catch(error) {
     console.error("Import data error:", error);
     res.status(500).json({ success: false, error: ERRORS.FAILED_TO_IMPORT });
  }
};

const getImportHistory = async (req, res) => {
  res.json({ success: true, imports: [], count: 0 });
};

const exportData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { export_type, export_scope, region_id, export_settings, selected_ids } = req.body;

    if (!export_type || !export_scope) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.EXPORT_PARAMS_REQUIRED });
    }

    const validation = validateDataType(export_type);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }
    
    // Fetch data based on scope
    let whereCondition = "";
    let whereParams = [];
    const currentUserRole = (req.user.role || "").toLowerCase();

    if (export_scope === "me") {
       whereCondition = "WHERE created_by = ?";
       whereParams = [userId];
    } else if (export_scope !== "all" || (currentUserRole !== "admin" && currentUserRole !== "manager")) {
       // Default to own data if trying to fetch all without admin rights or providing explicit user IDS
       whereCondition = "WHERE created_by = ?";
       whereParams = [userId];
    }
    // if export_scope === 'all' and user is admin, whereCondition remains empty

    const data = await dataHubService.fetchAllUserData(
      whereCondition,
      whereParams,
      10000 // A large reasonable limit for exports
    );

    // Filter relevant collection based on export_type
    let targetCollection = [];
    let headers = [];
    let rowMapper = (row) => row;

    switch (export_type) {
      case 'distance':
        targetCollection = transformDistanceMeasurements(data.distancesRaw);
        headers = ['name', 'total_distance_m', 'segment_count', 'points_json', 'created_at', 'region_id'];
        rowMapper = (row) => ({
          name: row.name || `Measurement ${row.id}`,
          total_distance_m: row.totalDistance || 0,
          segment_count: row.segments?.length || 0,
          points_json: JSON.stringify(row.points || []),
          created_at: row.createdAt || new Date(),
          region_id: row.regionId || region_id || ''
        });
        break;
      case 'polygon':
        targetCollection = data.polygons;
        headers = ['name', 'area_sqm', 'perimeter_m', 'coordinates_json', 'created_at', 'region_id'];
        rowMapper = (row) => ({
          name: row.polygon_name || row.name || `Polygon ${row.id}`,
          area_sqm: row.area || 0,
          perimeter_m: row.perimeter || 0,
          coordinates_json: JSON.stringify(row.coordinates || []),
          created_at: row.created_at || new Date(),
          region_id: row.region_id || region_id || ''
        });
        break;
      case 'circle':
        targetCollection = data.circles;
        headers = ['name', 'center_lat', 'center_lng', 'radius_m', 'created_at', 'region_id'];
        rowMapper = (row) => ({
          name: row.circle_name || row.name || `Circle ${row.id}`,
          center_lat: row.center_lat,
          center_lng: row.center_lng,
          radius_m: row.radius_meters || row.radius || 0,
          created_at: row.created_at || new Date(),
          region_id: row.region_id || region_id || ''
        });
        break;
      case 'sector':
        targetCollection = data.sectors;
        headers = ['name', 'center_lat', 'center_lng', 'radius_m', 'azimuth_deg', 'beamwidth_deg', 'frequency_mhz', 'created_at', 'region_id'];
        rowMapper = (row) => ({
          name: row.sector_name || row.name || `Sector ${row.id}`,
          center_lat: row.tower_lat || row.center_lat,
          center_lng: row.tower_lng || row.center_lng,
          radius_m: row.radius,
          azimuth_deg: row.azimuth || row.start_angle,
          beamwidth_deg: row.beamwidth || row.end_angle,
          frequency_mhz: row.frequency || '',
          created_at: row.created_at || new Date(),
          region_id: row.region_id || region_id || ''
        });
        break;
      case 'elevation':
        targetCollection = data.elevations;
        headers = ['name', 'path_distance_m', 'max_elevation_m', 'min_elevation_m', 'created_at', 'region_id'];
        rowMapper = (row) => ({
          name: row.profile_name || row.name || `Elevation ${row.id}`,
          path_distance_m: row.total_distance || row.total_distance_m || 0,
          max_elevation_m: row.max_elevation || row.max_elevation_m || 0,
          min_elevation_m: row.min_elevation || row.min_elevation_m || 0,
          created_at: row.created_at || new Date(),
          region_id: row.region_id || region_id || ''
        });
        break;
      default:
        targetCollection = [];
    }

    if (selected_ids && Array.isArray(selected_ids) && selected_ids.length > 0) {
      targetCollection = targetCollection.filter(item => selected_ids.includes(item.id));
    }

    const exportRows = targetCollection.map(rowMapper);
    const format = export_settings?.format || 'csv';
    const worksheet = xlsx.utils.json_to_sheet(exportRows, { header: headers });
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Data");
    
    let buffer;
    let contentType;
    if (format === 'csv') {
       buffer = xlsx.write(workbook, { bookType: 'csv', type: 'buffer' });
       contentType = 'text/csv';
    } else {
       buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
       contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    try {
      await logAudit(
        userId,
        `Downloaded Data Hub Report (${export_type})`,
        "DATA_EXPORTED",
        0,
        { export_type, export_scope, format, rowCount: exportRows.length, file_downloaded: `export_${export_type}_${Date.now()}.${format}` },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    // Rather than dealing with a mock file, return the file buffer directly inline.
    res.setHeader('Content-Disposition', `attachment; filename=export_${export_type}_${Date.now()}.${format}`);
    res.setHeader('Content-Type', contentType);
    res.send(buffer);

  } catch (error) {
    console.error("Export data error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_EXPORT });
  }
};

const getExportHistory = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const exports = await dataHubService.fetchExportHistory(
      req.user.id,
      limit,
      offset,
    );
    res.json({ success: true, exports, count: exports.length });
  } catch (error) {
    console.error("Get export history error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.FAILED_TO_GET_EXPORTS });
  }
};

const downloadTemplate = async (req, res) => {
  try {
    const { type } = req.params;
    let headers = [];
    let exampleRow = {};

    switch (type) {
      case 'distance':
        headers = ['name', 'total_distance_m', 'points_json'];
        exampleRow = { name: 'Sample Line', total_distance_m: 500, points_json: '[{"lat": 37.7749, "lng": -122.4194}, {"lat": 37.7849, "lng": -122.4094}]' };
        break;
      case 'polygon':
         headers = ['name', 'area_sqm', 'coordinates_json'];
         exampleRow = { name: 'Sample Polygon', area_sqm: 15000, coordinates_json: '[[{"lat": 37.77, "lng": -122.41}, {"lat": 37.78, "lng": -122.40}, {"lat": 37.76, "lng": -122.40}]]' };
         break;
      case 'circle':
         headers = ['name', 'center_lat', 'center_lng', 'radius_m'];
         exampleRow = { name: 'Sample Circle', center_lat: 37.7749, center_lng: -122.4194, radius_m: 50 };
         break;
      case 'sector':
         headers = ['name', 'center_lat', 'center_lng', 'radius_m', 'azimuth_deg', 'beamwidth_deg', 'frequency_mhz'];
         exampleRow = { name: 'Sample Sector', center_lat: 37.7749, center_lng: -122.4194, radius_m: 100, azimuth_deg: 0, beamwidth_deg: 120, frequency_mhz: '2400' };
         break;
      case 'elevation':
         headers = ['name', 'path_distance_m', 'max_elevation_m', 'min_elevation_m', 'elevation_data_json'];
         exampleRow = { name: 'Sample Elevation', path_distance_m: 1000, max_elevation_m: 500, min_elevation_m: 10, elevation_data_json: '[{"distance":0,"elevation":10},{"distance":1000,"elevation":500}]' };
         break;
      default:
         return res.status(400).json({ success: false, error: 'Invalid template type' });
    }

    const worksheet = xlsx.utils.json_to_sheet([exampleRow], { header: headers });
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Template");
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    
    res.setHeader('Content-Disposition', `attachment; filename=template_${type}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error("Download template error:", error);
    res.status(500).json({ success: false, error: "Failed to download template" });
  }
};

module.exports = {
  getAllData,
  deleteSingleData,
  deleteBulkData,
  importData,
  getImportHistory,
  exportData,
  downloadTemplate,
};
