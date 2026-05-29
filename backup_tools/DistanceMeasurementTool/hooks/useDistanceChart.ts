import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { formatDistance } from "../utils/distanceUtils";
import { ElevationDataPoint } from "../types/distanceTypes";
import { COLORS } from "../constants/distanceConstants";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UseDistanceChartProps {
  elevationData: ElevationDataPoint[];
  totalDistance: number;
  pointToElevationIndexMap: Map<string, number>;
  hoveredDataIndex: number | null;
  highPoint: ElevationDataPoint | null;
  lowPoint: ElevationDataPoint | null;
  handleGraphHover: (event: any, chartElements: any[]) => void;
  handleGraphClick: (event: any, chartElements: any[]) => void;
}

export const useDistanceChart = ({
  elevationData,
  totalDistance,
  pointToElevationIndexMap,
  hoveredDataIndex,
  highPoint,
  lowPoint,
  handleGraphHover,
  handleGraphClick
}: UseDistanceChartProps) => {
  // Chart data
  const chartData = {
    labels: elevationData.map((_: any, index: number) => {
      const distance = (totalDistance / elevationData.length) * index;

      const measurementPointLabel = Array.from(
        pointToElevationIndexMap.entries()
      ).find(([_, dataIndex]) => dataIndex === index)?.[0];

      if (measurementPointLabel) {
        return `${formatDistance(distance)}\n[${measurementPointLabel}]`;
      }

      return formatDistance(distance);
    }),
    datasets: [
      {
        label: "Elevation (m)",
        data: elevationData.map((d: any) => d.elevation),
        borderColor: COLORS.DEFAULT_BLUE,
        backgroundColor: COLORS.CHART_BG,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: elevationData.map((d: any, index: number) => {
          if (hoveredDataIndex === index) return 12;

          const isMeasurementPoint = Array.from(
            pointToElevationIndexMap.values()
          ).includes(index);
          if (isMeasurementPoint) return 9;

          if (
            highPoint &&
            d.elevation === highPoint.elevation &&
            d.distance === highPoint.distance
          )
            return 8;
          if (
            lowPoint &&
            d.elevation === lowPoint.elevation &&
            d.distance === lowPoint.distance
          )
            return 8;
          return 0;
        }),
        pointBackgroundColor: elevationData.map((d: any, index: number) => {
          if (hoveredDataIndex === index) return COLORS.HOVER;

          const isMeasurementPoint = Array.from(
            pointToElevationIndexMap.values()
          ).includes(index);
          if (isMeasurementPoint) return COLORS.MEASUREMENT_POINT;

          if (
            highPoint &&
            d.elevation === highPoint.elevation &&
            d.distance === highPoint.distance
          )
            return COLORS.HIGH_POINT;
          if (
            lowPoint &&
            d.elevation === lowPoint.elevation &&
            d.distance === lowPoint.distance
          )
            return COLORS.LOW_POINT;
          return COLORS.DEFAULT_BLUE;
        }),
        pointBorderColor: COLORS.STROKE,
        pointBorderWidth: elevationData.map((d: any, index: number) => {
          const isMeasurementPoint = Array.from(
            pointToElevationIndexMap.values()
          ).includes(index);
          return isMeasurementPoint ? 3 : 2;
        }),
        pointStyle: elevationData.map((d: any, index: number) => {
          const isMeasurementPoint = Array.from(
            pointToElevationIndexMap.values()
          ).includes(index);
          return isMeasurementPoint ? "rectRot" : "circle";
        }),
        pointHoverRadius: 12,
        pointHoverBackgroundColor: COLORS.HOVER,
        pointHoverBorderWidth: 3
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: handleGraphHover,
    onClick: handleGraphClick,
    plugins: {
      legend: {
        display: false
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
          color: COLORS.GRID_COLOR
        },
        title: {
          display: true,
          text: "Distance from Start Point",
          font: {
            size: 13,
            weight: "bold" as const
          },
          color: COLORS.TEXT_COLOR
        },
        ticks: {
          maxTicksLimit: 10,
          color: COLORS.TICK_COLOR
        }
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: COLORS.GRID_COLOR
        },
        title: {
          display: true,
          text: "Elevation (meters)",
          font: {
            size: 13,
            weight: "bold" as const
          },
          color: COLORS.TEXT_COLOR
        },
        ticks: {
          color: COLORS.TICK_COLOR
        }
      }
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false
    }
  };

  return { chartData, chartOptions };
};

