const { pool } = require('../../src/config/database');

/**
 * Batch insert items into database
 */
const batchInsertItems = async (batchValues, itemType) => {
  if (batchValues.length > 0) {
    console.log('💾 Batch inserting into database...');

    await pool.query(
      `INSERT INTO infrastructure_items
       (user_id, region_id, created_by, item_type, item_name, unique_id, network_id, ref_code,
        latitude, longitude, height,
        address_street, address_city, address_state, address_pincode,
        contact_name, contact_phone, contact_email,
        is_rented, rent_amount, agreement_start_date, agreement_end_date,
        landlord_name, landlord_contact, nature_of_business, owner,
        structure_type, ups_availability, ups_capacity, backup_capacity, power_source,
        equipment_list, connected_to, bandwidth,
        status, installation_date, maintenance_due_date,
        source, kml_filename, notes, properties, photos, capacity, equipment_details)
       VALUES ?`,
      [batchValues]
    );

    console.log(`✅ Successfully imported ${batchValues.length} ${itemType} items`);
    return { success: true, count: batchValues.length };
  } else {
    console.log('⚠️ No valid items to import');
    return { success: false, count: 0 };
  }
};

/**
 * Verify import statistics
 */
const verifyImport = async () => {
  const [[stats]] = await pool.query(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN item_type = 'POP' THEN 1 ELSE 0 END) as pop_count,
      SUM(CASE WHEN item_type = 'SubPOP' THEN 1 ELSE 0 END) as subpop_count,
      SUM(CASE WHEN source = 'KML' THEN 1 ELSE 0 END) as kml_count,
      SUM(CASE WHEN region_id IS NOT NULL THEN 1 ELSE 0 END) as with_region
     FROM infrastructure_items`
  );

  console.log('\n📊 Database Statistics:');
  console.log(`   Total items: ${stats.total}`);
  console.log(`   POP locations: ${stats.pop_count}`);
  console.log(`   SubPOP locations: ${stats.subpop_count}`);
  console.log(`   KML imports: ${stats.kml_count}`);
  console.log(`   With regions: ${stats.with_region}`);
  console.log(`   Without regions: ${stats.total - stats.with_region}`);
};

module.exports = {
  batchInsertItems,
  verifyImport
};
