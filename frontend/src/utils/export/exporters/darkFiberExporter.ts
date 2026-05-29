import JSZip from "jszip";
import {
  DarkFiberNodeFeature,
  DarkFiberRouteFeature,
} from "../../../services/darkFiberApiService";
import { escapeXML } from "../helpers";

export function generateDarkFiberKML(
  nodes: DarkFiberNodeFeature[],
  routes: DarkFiberRouteFeature[],
  title: string = "Dark Fiber Export",
): string {
  const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXML(title)}</name>
    <description>Exported from OptiConnect GIS Platform</description>

    <!-- Styles -->
    <Style id="popStyle">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href>
        </Icon>
        <color>ffff0000</color> <!-- Blue (AABBGGRR) -->
      </IconStyle>
    </Style>
    <Style id="customerStyle">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/placemark_square.png</href>
        </Icon>
        <color>ff00ff00</color> <!-- Green -->
      </IconStyle>
    </Style>
    <Style id="routeStyle">
      <LineStyle>
        <color>ff0000ff</color> <!-- Red -->
        <width>3</width>
      </LineStyle>
    </Style>
`;

  const nodePlacemarks = nodes
    .map((node) => {
      const isCustomer = node.properties.type === "Customer";
      const styleUrl = isCustomer ? "#customerStyle" : "#popStyle";
      const [lng, lat] = node.geometry.coordinates;

      return `    <Placemark>
      <name>${escapeXML(node.properties.name || "Unnamed Node")}</name>
      <description><![CDATA[
        <b>Type:</b> ${escapeXML(node.properties.type)}<br/>
        <b>ID:</b> ${node.properties.id}<br/>
      ]]></description>
      <styleUrl>${styleUrl}</styleUrl>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
    </Placemark>`;
    })
    .join("\n");

  const routePlacemarks = routes
    .map((route) => {
      const coordinatesString = route.geometry.coordinates
        .map((coord) => `${coord[0]},${coord[1]},0`)
        .join(" ");

      return `    <Placemark>
      <name>${escapeXML(route.properties.name || "Unnamed Route")}</name>
      <description><![CDATA[
        <b>Type:</b> Route<br/>
        <b>ID:</b> ${route.properties.id}<br/>
      ]]></description>
      <styleUrl>#routeStyle</styleUrl>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>${coordinatesString}</coordinates>
      </LineString>
    </Placemark>`;
    })
    .join("\n");

  const kmlFooter = `  </Document>
</kml>`;

  return kmlHeader + nodePlacemarks + "\n" + routePlacemarks + "\n" + kmlFooter;
}

export async function exportDarkFiberKMZ(
  nodes: DarkFiberNodeFeature[],
  routes: DarkFiberRouteFeature[],
  filename: string = "dark_fiber_export.kmz",
): Promise<void> {
  const kmlContent = generateDarkFiberKML(
    nodes,
    routes,
    filename.replace(".kmz", ""),
  );
  const zip = new JSZip();
  zip.file("doc.kml", kmlContent);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportDarkFiberCSV(
  nodes: DarkFiberNodeFeature[],
  routes: DarkFiberRouteFeature[],
  filename: string = "dark_fiber_export.csv",
) {
  let csvContent = "Type,ID,Name,Coordinates/Path\n";

  nodes.forEach((node) => {
    const type = node.properties.type;
    const id = node.properties.id;
    const name = `"${(node.properties.name || "").replace(/"/g, '""')}"`;
    const coords = `"${node.geometry.coordinates[0]}, ${node.geometry.coordinates[1]}"`;
    csvContent += `${type},${id},${name},${coords}\n`;
  });

  routes.forEach((route) => {
    const type = "Route";
    const id = route.properties.id;
    const name = `"${(route.properties.name || "").replace(/"/g, '""')}"`;
    const coords = `"${route.geometry.coordinates.length} points"`;
    csvContent += `${type},${id},${name},${coords}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
