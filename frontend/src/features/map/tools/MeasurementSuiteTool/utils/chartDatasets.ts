/**
 * Chart dataset generators for LOS (Line-of-Sight) analysis visualization
 */

/**
 * Creates the LOS Beam dataset - shows the direct line between antennas
 */
export const createLOSBeamDataset = (losAnalysis: any) => ({
  label: "LOS Beam",
  data: losAnalysis.points.map((point: any) => point.losElevation),
  borderColor: "rgb(34, 197, 94)",
  backgroundColor: "transparent",
  fill: false,
  tension: 0,
  borderWidth: 2,
  borderDash: [5, 5],
  pointRadius: 0,
  pointHoverRadius: 0
});

/**
 * Creates the Fresnel Zone Upper Boundary dataset
 */
export const createFresnelUpperDataset = (losAnalysis: any) => ({
  label: "Fresnel 60% Upper",
  data: losAnalysis.points.map((point: any) => point.losElevation + point.fresnel60Radius),
  borderColor: "rgba(251, 191, 36, 0.6)",
  backgroundColor: "rgba(251, 191, 36, 0.1)",
  fill: '+1',
  tension: 0.3,
  borderWidth: 1,
  pointRadius: 0,
  pointHoverRadius: 0
});

/**
 * Creates the Fresnel Zone Lower Boundary dataset
 */
export const createFresnelLowerDataset = (losAnalysis: any) => ({
  label: "Fresnel 60% Lower",
  data: losAnalysis.points.map((point: any) => point.losElevation - point.fresnel60Radius),
  borderColor: "rgba(251, 191, 36, 0.6)",
  backgroundColor: "rgba(251, 191, 36, 0.1)",
  fill: false,
  tension: 0.3,
  borderWidth: 1,
  pointRadius: 0,
  pointHoverRadius: 0
});

/**
 * Creates the Surface + Buildings dataset - shows ground elevation with obstacles
 */
export const createSurfaceDataset = (losAnalysis: any) => ({
  label: "Surface + Buildings",
  data: losAnalysis.points.map((point: any) => point.surfaceElevation),
  borderColor: "rgba(239, 68, 68, 0.7)",
  backgroundColor: "rgba(239, 68, 68, 0.2)",
  fill: true,
  tension: 0.1,
  borderWidth: 1.5,
  pointRadius: losAnalysis.points.map((point: any) => point.isObstructed ? 4 : 0),
  pointBackgroundColor: "rgb(220, 38, 38)",
  pointBorderColor: "#ffffff",
  pointBorderWidth: 2,
  pointHoverRadius: 6
});

/**
 * Returns all LOS-related datasets for the chart
 */
export const getLOSDatasets = (showLOSAnalysis: boolean, losAnalysis: any) => {
  if (!showLOSAnalysis || !losAnalysis) {
    return [];
  }

  return [
    createLOSBeamDataset(losAnalysis),
    createFresnelUpperDataset(losAnalysis),
    createFresnelLowerDataset(losAnalysis),
    createSurfaceDataset(losAnalysis)
  ];
};

