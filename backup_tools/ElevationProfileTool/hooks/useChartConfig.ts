import { formatDistance } from '../utils/index';
import { getLOSDatasets } from '../utils/chartDatasets';

export const useChartConfig = (state: any, handlers: { handleGraphHover: any, handleGraphClick: any }) => {
  const {
    elevationData, totalDistance, multiPointMode, pointToElevationIndexMap,
    hoveredDataIndex, highPoint, lowPoint, showLOSAnalysis, losAnalysis
  } = state;

  const { handleGraphHover, handleGraphClick } = handlers;

  // Helper to check if index is a measurement point
  const isMeasurementPoint = (index: number) => {
    if (!multiPointMode || !pointToElevationIndexMap) return false;
    return Array.from(pointToElevationIndexMap.values()).includes(index);
  };

  // Generate chart labels
  const chartLabels = elevationData.map((_: any, index: number) => {
    const distance = (totalDistance / elevationData.length) * index;
    if (multiPointMode && pointToElevationIndexMap) {
      const entries = Array.from((pointToElevationIndexMap as Map<string, number>).entries());
      const found = entries.find((entry) => entry[1] === index);
      if (found) return `${formatDistance(distance)}\n[${found[0]}]`;
    }
    return formatDistance(distance);
  });

  // Generate point styling arrays
  const pointRadii = elevationData.map((d: any, index: number) => {
    if (hoveredDataIndex === index) return 12;
    if (isMeasurementPoint(index)) return 9;
    if (highPoint && d.elevation === highPoint.elevation && d.distance === highPoint.distance) return 8;
    if (lowPoint && d.elevation === lowPoint.elevation && d.distance === lowPoint.distance) return 8;
    return 0;
  });

  const pointColors = elevationData.map((d: any, index: number) => {
    if (hoveredDataIndex === index) return "#f59e0b";
    if (isMeasurementPoint(index)) return "#8b5cf6";
    if (highPoint && d.elevation === highPoint.elevation && d.distance === highPoint.distance) return "#10b981";
    if (lowPoint && d.elevation === lowPoint.elevation && d.distance === lowPoint.distance) return "#3b82f6";
    return "rgb(59, 130, 246)";
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Elevation (m)",
        data: elevationData.map((d: any) => d.elevation),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: pointRadii,
        pointBackgroundColor: pointColors,
        pointBorderColor: "#ffffff",
        pointBorderWidth: elevationData.map((_: any, index: number) => isMeasurementPoint(index) ? 3 : 2),
        pointStyle: elevationData.map((_: any, index: number) => isMeasurementPoint(index) ? 'rectRot' : 'circle'),
        pointHoverRadius: 12,
        pointHoverBackgroundColor: "#f59e0b",
        pointHoverBorderWidth: 3
      },
      ...getLOSDatasets(showLOSAnalysis, losAnalysis)
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: handleGraphHover,
    onClick: handleGraphClick,
    plugins: {
      legend: {
        display: showLOSAnalysis && losAnalysis ? true : false,
        position: 'top' as const,
        labels: { font: { size: 11 }, boxWidth: 15, boxHeight: 2, usePointStyle: false }
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        bodyFont: { size: 13 },
        titleFont: { size: 14, weight: "bold" as const },
        callbacks: {
          title: function (context: any) {
            const index = context[0]?.dataIndex;
            if (showLOSAnalysis && losAnalysis && index !== undefined) {
              const point = losAnalysis.points[index];
              if (point?.isObstructed) return "⚠️ Obstructed Point";
            }
            return "Elevation Point";
          },
          label: function (context: any) {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y.toFixed(1);
            if (showLOSAnalysis && losAnalysis && datasetLabel === "Surface + Buildings") {
              const losPoint = losAnalysis.points[context.dataIndex];
              if (losPoint) {
                const buildingHeight = losPoint.surfaceElevation - losPoint.terrainElevation;
                if (buildingHeight > 0.5) return `${datasetLabel}: ${value} m (Building: +${buildingHeight.toFixed(1)}m)`;
              }
            }
            return `${datasetLabel}: ${value} m`;
          },
          afterLabel: function (context: any) {
            const index = context.dataIndex;
            if (showLOSAnalysis && losAnalysis && index !== undefined) {
              const point = losAnalysis.points[index];
              if (point) {
                const lines = [];
                if (point.isObstructed) {
                  lines.push(`🚫 Clearance: ${point.clearance.toFixed(1)}m`);
                  if (point.obstruction) lines.push(`Obstacle: ${point.obstruction.type}`);
                } else {
                  lines.push(`✓ Clearance: ${point.clearance.toFixed(1)}m`);
                }
                return lines.join('\n');
              }
            }
            return "💡 Click to pin location";
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: { display: true, color: "rgba(0, 0, 0, 0.05)" },
        title: { display: true, text: "Distance from Start Point", font: { size: 13, weight: "bold" as const }, color: "#374151" },
        ticks: { maxTicksLimit: 10, color: "#6b7280" }
      },
      y: {
        display: true,
        grid: { display: true, color: "rgba(0, 0, 0, 0.05)" },
        title: { display: true, text: "Elevation (meters)", font: { size: 13, weight: "bold" as const }, color: "#374151" },
        ticks: { color: "#6b7280" }
      }
    },
    interaction: { mode: "nearest" as const, axis: "x" as const, intersect: false }
  };

  return { chartData, chartOptions };
};

