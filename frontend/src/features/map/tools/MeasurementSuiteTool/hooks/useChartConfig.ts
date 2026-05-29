import { formatDistance } from '../utils/elevationUtils';

export type GraphType = 'line' | 'area' | 'spline' | 'bar' | 'scatter' | 'gradient';

export const useChartConfig = (state: any, handlers: { handleGraphHover: any }, graphType: GraphType = 'gradient') => {
  const {
    elevationData, totalDistance, multiPointMode, pointToElevationIndexMap,
    hoveredDataIndex, highPoint, lowPoint
  } = state;

  const { handleGraphHover } = handlers;

  // Helper to check if index is a measurement point
  const isMeasurementPoint = (index: number) => {
    if (!multiPointMode || !pointToElevationIndexMap) return false;
    return Array.from(pointToElevationIndexMap.values()).includes(index);
  };

    // Generate chart labels
  const chartLabels = elevationData.map((_: any, index: number) => {
    const distance = elevationData.length > 1 ? (totalDistance / (elevationData.length - 1)) * index : 0;
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
    if (graphType === 'scatter') return 5;
    return 0;
  });

  const pointColors = elevationData.map((d: any, index: number) => {
    if (hoveredDataIndex === index) return "#f59e0b";
    if (isMeasurementPoint(index)) return "#8b5cf6";
    if (highPoint && d.elevation === highPoint.elevation && d.distance === highPoint.distance) return "#10b981";
    if (lowPoint && d.elevation === lowPoint.elevation && d.distance === lowPoint.distance) return "#3b82f6";
    if (graphType === 'gradient') {
      const isHigh = highPoint && d.elevation === highPoint.elevation;
      const isLow = lowPoint && d.elevation === lowPoint.elevation;
      if (isHigh) return "#ef4444";
      if (isLow) return "#22c55e";
      return "#eab308";
    }
    return "rgb(59, 130, 246)";
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Elevation (m)",
        data: elevationData.map((d: any) => d.elevation),
        borderColor: (context: any) => {
          if (graphType === 'gradient') {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return "rgb(239, 68, 68)";
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgb(239, 68, 68)"); // Red
            gradient.addColorStop(0.5, "rgb(234, 179, 8)"); // Yellow
            gradient.addColorStop(1, "rgb(34, 197, 94)"); // Green
            return gradient;
          }
          return "rgb(59, 130, 246)";
        },
        backgroundColor: graphType === 'bar' ? pointColors : (context: any) => {
          if (graphType === 'line' || graphType === 'scatter' || graphType === 'spline') {
            return "transparent";
          }
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(59, 130, 246, 0.15)";
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          if (graphType === 'gradient') {
             gradient.addColorStop(0, "rgba(239, 68, 68, 0.6)");
             gradient.addColorStop(0.5, "rgba(234, 179, 8, 0.6)");
             gradient.addColorStop(1, "rgba(34, 197, 94, 0.6)");
             return gradient;
          }

          gradient.addColorStop(0, "rgba(59, 130, 246, 0.5)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
          return gradient;
        },
        fill: ['area', 'gradient'].includes(graphType),
        tension: ['spline', 'gradient'].includes(graphType) ? 0.4 : 0,
        showLine: graphType !== 'scatter',
        borderWidth: graphType === 'spline' ? 4 : (graphType === 'bar' ? 1 : 3),
        pointRadius: pointRadii,
        pointBackgroundColor: pointColors,
        pointBorderColor: "#ffffff",
        pointBorderWidth: elevationData.map((_: any, index: number) => isMeasurementPoint(index) ? 3 : (graphType === 'scatter' ? 1 : 2)),
        pointStyle: elevationData.map((_: any, index: number) => isMeasurementPoint(index) ? 'rectRot' : 'circle'),
        pointHoverRadius: 12,
        pointHoverBackgroundColor: "#f59e0b",
        pointHoverBorderWidth: 3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: handleGraphHover,
    plugins: {
      legend: {
        display: false
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
            return "Elevation Point";
          },
          label: function (context: any) {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y.toFixed(1);
            return `${datasetLabel}: ${value} m`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: { display: true, color: "rgba(0, 0, 0, 0.05)" },
        title: { display: true, text: "Distance from Start Point", font: { size: 13, weight: "bold" as const }, color: "#374151" },
        ticks: { 
          color: "#6b7280", 
          autoSkip: false, 
          maxRotation: 0,
          callback: function(value: any, index: number) {
            const length = chartLabels.length;
            if (length <= 10) return chartLabels[index];
            const step = Math.ceil((length - 1) / 9);
            if (index === 0 || index === length - 1) return chartLabels[index];
            if (index % step === 0 && (length - 1 - index) > (step * 0.5)) {
              return chartLabels[index];
            }
            return null;
          }
        }
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

