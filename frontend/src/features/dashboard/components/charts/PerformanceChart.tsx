import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  Line
} from "recharts";
import CustomTooltip from './CustomTooltip';
import type { PerfChartDataPoint } from '../../types/dashboardTypes';

interface PerformanceChartProps {
  data: PerfChartDataPoint[];
  timeRange: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  timeRange
}) => {
  const [activeMetric, setActiveMetric] = useState("all");

  const metrics = [
    { key: "all", label: "All Metrics", color: "#3b82f6" },
    { key: "avg", label: "Average Only", color: "#3b82f6" },
    { key: "minMax", label: "Min/Max Range", color: "#10b981" }
  ];

  const avgLatency =
    data.length > 0
      ? data.reduce((sum: number, point: any) => sum + point.avgLatency, 0) /
        data.length
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setActiveMetric(metric.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeMetric === metric.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Avg:{" "}
          <span className="font-bold text-blue-600">
            {avgLatency.toFixed(2)}ms
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="colorAvgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorMinGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis
            dataKey="time"
            stroke="#6b7280"
            style={{ fontSize: "11px" }}
            tick={{ fill: "#6b7280" }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "11px" }}
            tick={{ fill: "#6b7280" }}
            label={{
              value: "Latency (ms)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: "12px", fill: "#6b7280" }
            }}
          />
          <Tooltip content={<CustomTooltip type="performance" />} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />

          {avgLatency > 0 && (
            <ReferenceLine
              y={avgLatency}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{
                value: "Average",
                position: "right",
                style: { fontSize: "11px", fill: "#ef4444" }
              }}
            />
          )}

          {(activeMetric === "all" || activeMetric === "minMax") && (
            <Area
              type="monotone"
              dataKey="minLatency"
              stroke="#10b981"
              strokeWidth={1.5}
              fill="url(#colorMinGradient)"
              name="Min Latency"
              dot={false}
            />
          )}

          {(activeMetric === "all" || activeMetric === "avg") && (
            <Area
              type="monotone"
              dataKey="avgLatency"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#colorAvgGradient)"
              name="Avg Latency"
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6, fill: "#3b82f6" }}
            />
          )}

          {(activeMetric === "all" || activeMetric === "minMax") && (
            <Line
              type="monotone"
              dataKey="maxLatency"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: "#f59e0b", r: 3 }}
              name="Max Latency"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            {
              label: "Min Latency",
              value: Math.min(...data.map((d: any) => d.minLatency)),
              color: "text-green-600"
            },
            {
              label: "Avg Latency",
              value: avgLatency,
              color: "text-blue-600"
            },
            {
              label: "Max Latency",
              value: Math.max(...data.map((d: any) => d.maxLatency)),
              color: "text-orange-600"
            }
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center"
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className={`text-xl font-bold ${stat.color}`}>
                {stat.value.toFixed(2)}ms
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;

