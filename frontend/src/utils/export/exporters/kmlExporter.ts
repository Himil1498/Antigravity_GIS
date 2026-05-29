
import JSZip from 'jszip';
import type { InfrastructureItem } from '../types';
import { escapeXML } from '../helpers';

/**
 * Convert infrastructure/customer data to KML format
 */
export function generateKML(data: InfrastructureItem[], title: string = 'GIS Data Export'): string {
  const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXML(title)}</name>
    <description>Exported from OptiConnect GIS Platform</description>

    <!-- Styles -->
    <Style id="infraStyle">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href>
        </Icon>
        <color>ff0000ff</color>
      </IconStyle>
    </Style>
    <Style id="customerStyle">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/placemark_square.png</href>
        </Icon>
        <color>ff00ff00</color>
      </IconStyle>
    </Style>
`;

  const placemarks = data.map(item => {
    const isCustomer = !!item.customer_name;
    const styleUrl = isCustomer ? '#customerStyle' : '#infraStyle';

    return `    <Placemark>
      <name>${escapeXML(item.item_name || 'Unnamed')}</name>
      <description><![CDATA[
        <b>Type:</b> ${escapeXML(item.item_type)}<br/>
        ${item.unique_id ? `<b>Unique ID:</b> ${escapeXML(item.unique_id)}<br/>` : ''}
        ${item.customer_name ? `<b>Customer:</b> ${escapeXML(item.customer_name)}<br/>` : ''}
        ${item.nature_of_business ? `<b>Nature of Business:</b> ${escapeXML(item.nature_of_business)}<br/>` : ''}
        ${item.address_street ? `<b>Address:</b> ${escapeXML(item.address_street)}${item.address_city ? ', ' + escapeXML(item.address_city) : ''}${item.address_state ? ', ' + escapeXML(item.address_state) : ''}<br/>` : ''}
        ${item.contact_name ? `<b>Contact:</b> ${escapeXML(item.contact_name)}${item.contact_phone ? ' (' + escapeXML(item.contact_phone) + ')' : ''}<br/>` : ''}
        ${item.status ? `<b>Status:</b> ${escapeXML(item.status)}<br/>` : ''}
        ${item.notes ? `<b>Notes:</b> ${escapeXML(item.notes)}<br/>` : ''}
      ]]></description>
      <styleUrl>${styleUrl}</styleUrl>
      <Point>
        <coordinates>${item.longitude},${item.latitude},0</coordinates>
      </Point>
    </Placemark>
`;
  }).join('\n');

  const kmlFooter = `  </Document>
</kml>`;

  return kmlHeader + placemarks + kmlFooter;
}

/**
 * Generate KMZ (zipped KML)
 */
export async function generateKMZ(data: InfrastructureItem[], title: string = 'GIS Data Export'): Promise<Blob> {
  const kmlContent = generateKML(data, title);
  const zip = new JSZip();
  zip.file('doc.kml', kmlContent);

  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}

