const path = require('path');
const { parseExtendedData } = require('./parser');
const { detectRegionFromCoordinates } = require('./regionDetector');

// Admin user ID (adjust if needed)
const ADMIN_USER_ID = 1;

/**
 * Transform placemarks to batch insert values
 */
const transformPlacemarks = async (placemarks, itemType, filePath) => {
  const batchValues = [];
  let processedCount = 0;
  let skippedCount = 0;

  console.log('🔄 Processing placemarks...');

  for (const placemark of placemarks) {
    const name = placemark.name?.[0] || 'Unnamed';
    const coordinatesStr = placemark.Point?.[0]?.coordinates?.[0]?.trim();

    if (!coordinatesStr) {
      skippedCount++;
      continue;
    }

    const [lng, lat, height] = coordinatesStr.split(',').map(v => parseFloat(v.trim()));

    if (isNaN(lat) || isNaN(lng)) {
      skippedCount++;
      continue;
    }

    // Parse extended data
    const extData = parseExtendedData(placemark);

    // Generate unique ID
    const uniqueId = extData.unique_id || `KML-${itemType}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Detect region
    const detectedRegionId = await detectRegionFromCoordinates(lat, lng);

    // Map status to valid ENUM values
    const statusMapping = {
      'RFS': 'RFS',
      'L1': 'Active',
      'L2': 'Active',
      'L3': 'Active',
      'LIVE': 'Active',
      'Active': 'Active',
      'Inactive': 'Inactive',
      'Maintenance': 'Maintenance',
      'Planned': 'Planned',
      'Damaged': 'Damaged'
    };
    const mappedStatus = statusMapping[extData.status] || 'Active';

    // Map structure_type to valid ENUM values (handle empty strings)
    const structureTypeMapping = {
      'Tower': 'Tower',
      'Building': 'Building',
      'Ground': 'Ground',
      'Rooftop': 'Rooftop',
      'Other': 'Other'
    };
    const mappedStructureType = (extData.structure_type && extData.structure_type.trim())
      ? (structureTypeMapping[extData.structure_type] || 'Other')
      : 'Tower';

    // Prepare row data
    batchValues.push([
      ADMIN_USER_ID,                           // user_id
      detectedRegionId,                        // region_id
      ADMIN_USER_ID,                           // created_by
      itemType,                                // item_type
      name,                                    // item_name
      uniqueId,                                // unique_id
      extData.network_id || `NET-${uniqueId}`, // network_id
      extData.ref_code || null,                // ref_code
      lat,                                     // latitude
      lng,                                     // longitude
      height || null,                          // height
      extData.address || null,                 // address_street
      null,                                    // address_city
      null,                                    // address_state
      null,                                    // address_pincode
      extData.contact_name || null,            // contact_name
      extData.contact_no || null,              // contact_phone
      null,                                    // contact_email
      extData.is_rented === 'True',            // is_rented
      parseFloat(extData.rent_amount) || null, // rent_amount
      extData.agreement_start_date || null,    // agreement_start_date
      extData.agreement_end_date || null,      // agreement_end_date
      null,                                    // landlord_name
      null,                                    // landlord_contact
      extData.nature_of_bussiness || null,     // nature_of_business
      extData.owner || null,                   // owner
      mappedStructureType,                     // structure_type (mapped to valid ENUM)
      extData.ups_avaibility === 'True',       // ups_availability
      extData.ups_capacity || null,            // ups_capacity
      extData.backup_capacity || null,         // backup_capacity
      'Grid',                                  // power_source
      null,                                    // equipment_list
      null,                                    // connected_to
      null,                                    // bandwidth
      mappedStatus,                            // status (mapped to valid ENUM)
      null,                                    // installation_date
      null,                                    // maintenance_due_date
      'KML',                                   // source
      path.basename(filePath),                 // kml_filename
      null,                                    // notes
      JSON.stringify(extData),                 // properties
      null,                                    // photos
      null,                                    // capacity
      null                                     // equipment_details
    ]);

    processedCount++;

    // Show progress every 100 items
    if (processedCount % 100 === 0) {
      process.stdout.write(`\r   Processed: ${processedCount}`);
    }
  }

  console.log(`\n✅ Processed ${processedCount} items (skipped ${skippedCount})`);
  return { batchValues, processedCount, skippedCount };
};

module.exports = {
  transformPlacemarks
};
