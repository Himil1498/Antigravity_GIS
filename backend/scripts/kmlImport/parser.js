const fs = require('fs');
const { parseStringPromise } = require('xml2js');

/**
 * Parse ExtendedData from KML placemark
 */
const parseExtendedData = (placemark) => {
  const data = {};
  if (placemark.ExtendedData && placemark.ExtendedData[0]?.Data) {
    placemark.ExtendedData[0].Data.forEach(item => {
      const name = item.$.name;
      const value = item.value?.[0] || '';
      data[name] = value;
    });
  }
  return data;
};

/**
 * Read and parse KML file
 */
const parseKMLFile = async (filePath) => {
  console.log(`\n📂 Reading file: ${filePath}`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Read KML file
  const kmlData = fs.readFileSync(filePath, 'utf8');
  console.log(`✅ File loaded (${(kmlData.length / 1024).toFixed(2)} KB)`);

  // Parse KML
  console.log('🔄 Parsing KML data...');
  const parsedKML = await parseStringPromise(kmlData);

  // Extract placemarks
  let placemarks = [];
  if (parsedKML?.kml?.Document?.[0]?.Placemark) {
    placemarks = parsedKML.kml.Document[0].Placemark;
  }
  if (parsedKML?.kml?.Document?.[0]?.Folder) {
    const folders = parsedKML.kml.Document[0].Folder;
    folders.forEach(folder => {
      if (folder.Placemark) {
        placemarks.push(...folder.Placemark);
      }
    });
  }

  console.log(`📊 Found ${placemarks.length} placemarks`);
  return placemarks;
};

module.exports = {
  parseExtendedData,
  parseKMLFile
};
