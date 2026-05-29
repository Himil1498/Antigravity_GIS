import React, { useRef } from "react";
import { Line } from "react-chartjs-2";
import { formatDistance } from "../../../../utils/elevation/index";
import { ElevationChartProps } from "./ElevationChartTypes";

const ElevationChart: React.FC<ElevationChartProps> = ({ elevationData, totalDistance, pointToIndexMap, highPoint, lowPoint, hasLOSData, losAnalysis }) => {
  const chartRef = useRef<any>(null);

  // Chart data configuration
  const chartData = {
    labels: elevationData.map((_, index) => {
      const distance = elevationData.length > 1 ? (totalDistance / (elevationData.length - 1)) * index : 0;

      // Check if this index corresponds to a measurement point
      const measurementPointLabel = Array.from(pointToIndexMap.entries()).find(
        ([_, dataIndex]) => dataIndex === index
      )?.[0];

      if (measurementPointLabel) {
        return `${formatDistance(distance)}\n[${measurementPointLabel}]`;
      }

      return formatDistance(distance);
    }),
    datasets: [
      {
        label: "Elevation (m)",
        data: elevationData.map((d) => Number(d.elevation) || 0),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: elevationData.map((d, index) => {
          // Measurement points
          const isMeasurementPoint = Array.from(pointToIndexMap.values()).includes(index);
          if (isMeasurementPoint) return 9;

          // High/Low points
          const dElev = Number(d.elevation) || 0;
          const dDist = Number(d.distance) || 0;
          const highElev = Number(highPoint?.elevation) || 0;
          const highDist = Number(highPoint?.distance) || 0;
          const lowElev = Number(lowPoint?.elevation) || 0;
          const lowDist = Number(lowPoint?.distance) || 0;

          if (Math.abs(dElev - highElev) < 0.1 && Math.abs(dDist - highDist) < 0.1)
            return 8;
          if (Math.abs(dElev - lowElev) < 0.1 && Math.abs(dDist - lowDist) < 0.1)
            return 8;

          return 0;
        }),
        pointBackgroundColor: elevationData.map((d, index) => {
          // Measurement points - purple
          const isMeasurementPoint = Array.from(pointToIndexMap.values()).includes(index);
          if (isMeasurementPoint) return "#8b5cf6";

          // High/Low points
          const dElev = Number(d.elevation) || 0;
          const dDist = Number(d.distance) || 0;
          const highElev = Number(highPoint?.elevation) || 0;
          const highDist = Number(highPoint?.distance) || 0;
          const lowElev = Number(lowPoint?.elevation) || 0;
          const lowDist = Number(lowPoint?.distance) || 0;

          // High point - green
          if (Math.abs(dElev - highElev) < 0.1 && Math.abs(dDist - highDist) < 0.1)
            return "#10b981";

          // Low point - blue
          if (Math.abs(dElev - lowElev) < 0.1 && Math.abs(dDist - lowDist) < 0.1)
            return "#3b82f6";

          return "rgb(59, 130, 246)";
        }),
        pointBorderColor: "#ffffff",
        pointBorderWidth: elevationData.map((d, index) => {
          const isMeasurementPoint = Array.from(pointToIndexMap.values()).includes(index);
          return isMeasurementPoint ? 3 : 2;
        }),
        pointStyle: elevationData.map((d, index) => {
          const isMeasurementPoint = Array.from(pointToIndexMap.values()).includes(index);
          return isMeasurementPoint ? 'rectRot' : 'circle';
        }),
        pointHoverRadius: 12,
        pointHoverBackgroundColor: "#f59e0b",
        pointHoverBorderWidth: 3
      },
      // LOS Beam Line
      ...(hasLOSData && losAnalysis ? [{
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
      }] : []),
      // Fresnel Zone Upper Boundary
      ...(hasLOSData && losAnalysis ? [{
        label: "Fresnel 60% Upper",
        data: losAnalysis.points.map((point: any) => point.losElevation + point.fresnel60Radius),
        borderColor: "rgba(251, 191, 36, 0.6)",
        backgroundColor: "rgba(251, 191, 36, 0.1)",
        fill: '+1',
        tension: 0.3,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 0
      }] : []),
      // Fresnel Zone Lower Boundary
      ...(hasLOSData && losAnalysis ? [{
        label: "Fresnel 60% Lower",
        data: losAnalysis.points.map((point: any) => point.losElevation - point.fresnel60Radius),
        borderColor: "rgba(251, 191, 36, 0.6)",
        backgroundColor: "rgba(251, 191, 36, 0.1)",
        fill: false,
        tension: 0.3,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 0
      }] : []),
      // Buildings/Obstacles Surface Height
      ...(hasLOSData && losAnalysis ? [{
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
      }] : [])
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: hasLOSData && losAnalysis ? true : false,
        position: 'top' as const,
        labels: {
          font: {
            size: 11
          },
          boxWidth: 15,
          boxHeight: 2,
          usePointStyle: false
        }
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        bodyFont: {
          size: 13
        },
        titleFont: {
          size: 14,
          weight: "bold" as const
        },
        callbacks: {
          title: function () {
            return "Elevation Point";
          },
          label: function (context: any) {
            return `${context.parsed.y.toFixed(1)} m`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)"
        },
        title: {
          display: true,
          text: "Distance from Start Point",
          font: {
            size: 13,
            weight: "bold" as const
          },
          color: "#374151"
        },
        ticks: {
          color: "#6b7280",
          autoSkip: false,
          maxRotation: 0,
          callback: function(value: any, index: number) {
            const length = chartData.labels.length;
            if (length <= 10) return chartData.labels[index];
            const step = Math.ceil((length - 1) / 9);
            if (index === 0 || index === length - 1) return chartData.labels[index];
            if (index % step === 0 && (length - 1 - index) > (step * 0.5)) {
              return chartData.labels[index];
            }
            return null;
          }
        }
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)"
        },
        title: {
          display: true,
          text: "Elevation (meters)",
          font: {
            size: 13,
            weight: "bold" as const
          },
          color: "#374151"
        },
        ticks: {
          color: "#6b7280"
        }
      }
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false
    }
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-inner">
        <div style={{ height: "400px" }}>
          <Line data={chartData} options={chartOptions} ref={chartRef} redraw={true} />
        </div>
      </div>
    </div>
  );
};

export default ElevationChart;

