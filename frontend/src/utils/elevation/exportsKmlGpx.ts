import { calculateHaversineDistance } from './calculations';
import { formatDistance, formatElevation } from './formatting';
import type { ElevationPoint } from './types';

export type LabeledPoint = { lat: number; lng: number; label: string };

/**
 * Export elevation profile to KML format.
 */
export const exportElevationToKML = (
  elevationData: ElevationPoint[],
  measurementPoints: LabeledPoint[],
  measurementName: string,
  totalDistance: number,
  maxElevation: number,
  minElevation: number,
  elevationGain: number,
  elevationLoss: number
): string => {
  const timestamp = new Date().toISOString();

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
  <Document>
    <name>${measurementName}</name>
    <description><![CDATA[
      <h3>Elevation Profile: ${measurementName}</h3>
      <p><strong>Created:</strong> ${timestamp}</p>
      <p><strong>Total Distance:</strong> ${formatDistance(totalDistance)}</p>
      <p><strong>Max Elevation:</strong> ${formatElevation(maxElevation)}</p>
      <p><strong>Min Elevation:</strong> ${formatElevation(minElevation)}</p>
      <p><strong>Elevation Gain:</strong> ${formatElevation(elevationGain)}</p>
      <p><strong>Elevation Loss:</strong> ${formatElevation(elevationLoss)}</p>
    ]]></description>

    <!-- Styles for elevation path and measurement points -->
    <Style id="elevationPath">
      <LineStyle>
        <color>ff00ff00</color>
        <width>4</width>
      </LineStyle>
    </Style>
    <Style id="measurementPoint">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/red-circle.png</href>
        </Icon>
      </IconStyle>
      <LabelStyle>
        <scale>1.1</scale>
      </LabelStyle>
    </Style>

    <!-- Measurement Points (A, B, C, D...) -->
    <Folder>
      <name>Measurement Points</name>
`;

  measurementPoints.forEach((point) => {
    kml += `      <Placemark>
        <name>Point ${point.label}</name>
        <description><![CDATA[
          <p><strong>Label:</strong> ${point.label}</p>
          <p><strong>Coordinates:</strong> ${point.lat.toFixed(
            6
          )}, ${point.lng.toFixed(6)}</p>
        ]]></description>
        <styleUrl>#measurementPoint</styleUrl>
        <Point>
          <coordinates>${point.lng.toFixed(6)},${point.lat.toFixed(6)},0</coordinates>
        </Point>
      </Placemark>
`;
  });

  kml += `    </Folder>

    <!-- Elevation Path -->
    <Placemark>
      <name>Elevation Profile Path</name>
      <description>3D path with elevation data</description>
      <styleUrl>#elevationPath</styleUrl>
      <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <altitudeMode>absolute</altitudeMode>
        <coordinates>
`;

  elevationData.forEach((point) => {
    kml += `          ${point.location.lng.toFixed(6)},${point.location.lat.toFixed(
      6
    )},${point.elevation.toFixed(2)}\n`;
  });

  kml += `        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;

  return kml;
};

/**
 * Export elevation profile to GPX format.
 */
export const exportElevationToGPX = (
  elevationData: ElevationPoint[],
  measurementPoints: LabeledPoint[],
  measurementName: string,
  totalDistance: number,
  maxElevation: number,
  minElevation: number,
  elevationGain: number,
  elevationLoss: number
): string => {
  const timestamp = new Date().toISOString();

  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="OptiConnect GIS"
     xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${measurementName}</name>
    <desc>Elevation Profile created by OptiConnect GIS</desc>
    <time>${timestamp}</time>
    <keywords>elevation, profile, gis</keywords>
  </metadata>

  <!-- Measurement Points as Waypoints -->
`;

  measurementPoints.forEach((point) => {
    let nearestElevation = 0;
    let minDist = Infinity;

    elevationData.forEach((elevPoint) => {
      const dist = calculateHaversineDistance(
        point.lat,
        point.lng,
        elevPoint.location.lat,
        elevPoint.location.lng
      );
      if (dist < minDist) {
        minDist = dist;
        nearestElevation = elevPoint.elevation;
      }
    });

    gpx += `  <wpt lat="${point.lat.toFixed(6)}" lon="${point.lng.toFixed(6)}">
    <ele>${nearestElevation.toFixed(2)}</ele>
    <name>Point ${point.label}</name>
    <desc>Measurement point ${point.label}</desc>
    <sym>Flag, Blue</sym>
  </wpt>
`;
  });

  gpx += `
  <!-- Elevation Profile as Track -->
  <trk>
    <name>${measurementName} - Elevation Track</name>
    <desc>Total Distance: ${formatDistance(
      totalDistance
    )} | Max Elevation: ${formatElevation(maxElevation)} | Min Elevation: ${formatElevation(
    minElevation
  )} | Gain: ${formatElevation(elevationGain)} | Loss: ${formatElevation(
    elevationLoss
  )}</desc>
    <trkseg>
`;

  elevationData.forEach((point, index) => {
    const pointTime = new Date(new Date(timestamp).getTime() + index * 1000).toISOString();
    gpx += `      <trkpt lat="${point.location.lat.toFixed(
        6
      )}" lon="${point.location.lng.toFixed(6)}">
        <ele>${point.elevation.toFixed(2)}</ele>
        <time>${pointTime}</time>
      </trkpt>
`;
  });

  gpx += `    </trkseg>
  </trk>
</gpx>`;

  return gpx;
};

export const downloadKML = (kmlContent: string, filename: string): void => {
  const blob = new Blob([kmlContent], {
    type: 'application/vnd.google-earth.kml+xml;charset=utf-8;',
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.kml') ? filename : `${filename}.kml`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadGPX = (gpxContent: string, filename: string): void => {
  const blob = new Blob([gpxContent], {
    type: 'application/gpx+xml;charset=utf-8;',
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.gpx') ? filename : `${filename}.gpx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};



