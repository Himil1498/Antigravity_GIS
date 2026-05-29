const xlsx = require('xlsx');
const { create: createXml } = require('xmlbuilder2');
const AdmZip = require('adm-zip');

class ExcelKmlService {
  /**
   * Parse Excel buffer and return JSON data
   * @param {Buffer} buffer - Excel file buffer
   * @returns {Array} - Array of objects
   */
  static parseExcel(buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // raw: false ensures we get formatted strings, but for lat/lng we might want raw numbers.
    // Let's use raw: true and handle parsing manually if needed.
    return xlsx.utils.sheet_to_json(sheet, { raw: true });
  }

  /**
   * Validate that the data has required columns
   * @param {Array} data - Parsed Excel data
   * @returns {Object} - { valid: boolean, errors: array }
   */
  static validateData(data) {
    const errors = [];
    if (!data || data.length === 0) {
      return { valid: false, errors: ['Excel file is empty'] };
    }

    // Normalize keys to lowercase for flexible matching
    const sampleRow = data[0];
    const keys = Object.keys(sampleRow).map(k => k.toLowerCase());

    const required = ['name', 'latitude', 'longitude'];
    const missing = required.filter(field => !keys.includes(field));

    if (missing.length > 0) {
      return {
        valid: false,
        errors: [`Missing required columns: ${missing.join(', ')}`]
      };
    }

    // Check first 10 rows for valid coordinates
    data.slice(0, 10).forEach((row, index) => {
      // Find the actual key casing for lat/lng
      const latKey = Object.keys(row).find(k => k.toLowerCase() === 'latitude');
      const lngKey = Object.keys(row).find(k => k.toLowerCase() === 'longitude');
      
      const lat = parseFloat(row[latKey]);
      const lng = parseFloat(row[lngKey]);

      if (isNaN(lat) || isNaN(lng)) {
        errors.push(`Row ${index + 2}: Invalid Coordinates`);
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors.slice(0, 5) // Limit error feedback
    };
  }

  /**
   * convert JSON data to KML string
   * @param {Array} data - Validated data
   * @returns {string} - KML XML String
   */
  static generateKml(data) {
    const doc = createXml({ version: '1.0', encoding: 'UTF-8' })
      .ele('kml', { xmlns: 'http://www.opengis.net/kml/2.2' })
        .ele('Document')
          .ele('name').txt('OptiConnect Export').up();

    // Default Style for pins (fallback)
    doc.ele('Style', { id: 'defaultPin' })
      .ele('IconStyle')
        .ele('scale').txt('1.1').up()
        .ele('Icon')
          .ele('href').txt('http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png').up()
        .up()
      .up()
    .up();

    data.forEach((row, index) => {
      // Keys might be case-insensitive, find them
      const keys = Object.keys(row);
      const getKey = (name) => keys.find(k => k.toLowerCase() === name.toLowerCase());

      const name = row[getKey('name')] || 'Unnamed Point';
      const lat = row[getKey('latitude')];
      const lng = row[getKey('longitude')];
      const desc = row[getKey('description')] || '';
      const iconUrl = row[getKey('icon')]; // Look for 'Icon' column
      
      const placemark = doc.ele('Placemark');
      placemark.ele('name').txt(name).up();
      if (desc) placemark.ele('description').txt(desc).up();
      
      // Inline Style for Custom Icon or Fallback to Shared Style
      if (iconUrl && typeof iconUrl === 'string' && iconUrl.trim() !== '') {
          placemark.ele('Style')
            .ele('IconStyle')
                .ele('scale').txt('1.1').up()
                .ele('Icon')
                    .ele('href').txt(iconUrl.trim()).up()
                .up()
            .up()
          .up();
      } else {
          placemark.ele('styleUrl').txt('#defaultPin').up();
      }
      
      placemark.ele('Point')
        .ele('coordinates').txt(`${lng},${lat},0`).up()
      .up();
      
      placemark.up();
    });

    return doc.end({ prettyPrint: true });
  }

  /**
   * Create KMZ (Zipped KML)
   * @param {Array} data 
   * @returns {Buffer}
   */
  static generateKmz(data) {
    const kmlString = this.generateKml(data);
    const zip = new AdmZip();
    zip.addFile('doc.kml', Buffer.from(kmlString, 'utf8'));
    return zip.toBuffer();
  }

  /**
   * Generate a sample Excel file for users to download
   * @returns {Buffer}
   */
  /**
   * Generate a sample Excel file for users to download
   * @returns {Buffer}
   */
  static generateSampleExcel() {
    // Determine input structure
    const data = [
      {
        Name: 'Site A - Tower',
        Latitude: 23.0225,
        Longitude: 72.5714,
        Description: 'Main hub site near river',
        Icon: 'http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png'
      },
      {
        Name: 'Site B - Node',
        Latitude: 23.0300,
        Longitude: 72.5800,
        Description: 'Distribution node',
        Icon: 'http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png'
      },
      {
        Name: 'Customer X',
        Latitude: 23.0250,
        Longitude: 72.5750,
        Description: 'Enterprise customer connection',
        Icon: '' // Empty to test default fallback
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(data);
    
    // Set column widths for better UX
    worksheet['!cols'] = [
      { wch: 20 }, // Name
      { wch: 15 }, // Latitude
      { wch: 15 }, // Longitude
      { wch: 40 }, // Description
      { wch: 50 }  // Icon
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sample Data');

    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

module.exports = ExcelKmlService;
