
import type { InfrastructureItem, ExportFormat, ExportCategory } from "./types";
import { downloadBlob } from "./helpers";
import { generateKML, generateKMZ } from "./exporters/kmlExporter";
import { generateXLSX } from "./exporters/excelExporter";
import { generateCSV } from "./exporters/csvExporter";
import { generateJSON } from "./exporters/jsonExporter";

export * from "./types";
export * from "./helpers";
export * from "./exporters/kmlExporter";
export * from "./exporters/excelExporter";
export * from "./exporters/csvExporter";
export * from "./exporters/jsonExporter";

/**
 * Export data in specified format
 */
export async function exportData(
  data: InfrastructureItem[],
  format: ExportFormat,
  fileName: string = 'gis_data_export'
): Promise<void> {
  let blob: Blob;
  let fullFileName: string;

  switch (format) {
    case 'kml':
      blob = new Blob([generateKML(data, fileName)], { type: 'application/vnd.google-earth.kml+xml' });
      fullFileName = `${fileName}.kml`;
      break;

    case 'kmz':
      blob = await generateKMZ(data, fileName);
      fullFileName = `${fileName}.kmz`;
      break;

    case 'xlsx':
      blob = generateXLSX(data, fileName);
      fullFileName = `${fileName}.xlsx`;
      break;

    case 'csv':
      blob = generateCSV(data);
      fullFileName = `${fileName}.csv`;
      break;

    case 'json':
      blob = generateJSON(data);
      fullFileName = `${fileName}.json`;
      break;

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  // Trigger download
  downloadBlob(blob, fullFileName);
}

/**
 * Filter and export data by category
 */
export async function exportByCategory(
  allData: InfrastructureItem[],
  category: ExportCategory,
  format: ExportFormat,
  dataType: 'infrastructure' | 'customer'
): Promise<void> {
  let filteredData: InfrastructureItem[];
  let fileName: string;

  if (category === 'all') {
    filteredData = allData;
    fileName = `${dataType}_all_data`;
  } else {
    if (dataType === 'infrastructure') {
      filteredData = allData.filter(item => item.item_type === category);
      fileName = `infrastructure_${category.toLowerCase().replace(/\s+/g, '_')}`;
    } else {
      filteredData = allData.filter(item => item.customer_name === category);
      const shortName = category.split(' ')[0].toLowerCase(); // e.g., "reliance", "vodafone"
      fileName = `customer_${shortName}`;
    }
  }

  await exportData(filteredData, format, fileName);
}

