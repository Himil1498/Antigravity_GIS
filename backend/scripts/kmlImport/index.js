/**
 * KML Import Script
 * Imports pop_location.kml and sub_pop_location.kml into the database
 * Usage: node scripts/kmlImport/index.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const path = require('path');
const { parseKMLFile } = require('./parser');
const { transformPlacemarks } = require('./transformer');
const { batchInsertItems, verifyImport } = require('./db');

/**
 * Import a single KML file
 */
const importKMLFile = async (filePath, itemType) => {
  try {
    const placemarks = await parseKMLFile(filePath);

    if (placemarks.length === 0) {
      console.error('❌ No placemarks found in KML file');
      return { success: false, count: 0 };
    }

    const { batchValues } = await transformPlacemarks(placemarks, itemType, filePath);

    return await batchInsertItems(batchValues, itemType);
  } catch (error) {
    console.error(`❌ Error importing ${itemType}:`, error);
    return { success: false, count: 0, error: error.message };
  }
};

/**
 * Main import function
 */
const importAllKMLFiles = async () => {
  try {
    console.log('🚀 KML Import Script Started\n');
    console.log('='.repeat(60));

    // Define file paths (adjusted relative to this script)
    const kmlFiles = [
      {
        path: path.join(__dirname, '../../public/pop_location.kml'),
        type: 'POP'
      },
      {
        path: path.join(__dirname, '../../public/sub_pop_location.kml'),
        type: 'SubPOP'
      }
    ];

    let totalImported = 0;

    // Import each file
    for (const file of kmlFiles) {
      const result = await importKMLFile(file.path, file.type);
      if (result.success) {
        totalImported += result.count;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Import Complete!');
    console.log(`📊 Total items imported: ${totalImported}`);
    console.log('\n🔍 Verifying import...');

    // Verify import
    await verifyImport();

    console.log('\n✨ Done!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
};

// Run import
importAllKMLFiles();
