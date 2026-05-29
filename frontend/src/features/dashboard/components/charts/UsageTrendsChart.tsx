import React, { useState } from "react";
import { ResponsiveContainer, ComposedChart, AreaChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Area, Bar, PieChart, Pie, Cell } from "recharts";
import CustomTooltip from './CustomTooltip';
import { UsageTrendsChartProps, CHART_COLORS, calculateTotals, formatLabel } from '../../utils/UsageTrendsChartUtils';

const UsageTrendsChart: React.FC<UsageTrendsChartProps> = ({ data }) => {
  const [viewType, setViewType] = useState("line");
  const [showTotal, setShowTotal] = useState(true);

  const totals = calculateTotals(data);
  const totalSum = Object.values(totals).reduce((a: any, b: any) => a + b, 0) as number;
  const pieData = Object.entries(totals).map(([key, value]) => ({
    name: formatLabel(key),
    value: value as number,
    percentage: totalSum > 0 ? (((value as number) / totalSum) * 100).toFixed(1) : "0"
  }));

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewType("line")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewType === "line"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Line Chart
          </button>
          <button
            onClick={() => setViewType("area")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewType === "area"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Stacked Area
          </button>
          <button
            onClick={() => setViewType("bar")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewType === "bar"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Stacked Bar
          </button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTotal}
            onChange={(e) => setShowTotal(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded"
          />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Show Total Line
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={350}>
            {viewType === "line" ? (
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: "11px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "11px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />

                {(Object.entries(CHART_COLORS) as [string, string][]).map(([key, color]) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: color }}
                    activeDot={{ r: 5 }}
                    name={
                      key.charAt(0).toUpperCase() +
                      key.slice(1).replace("_", " ")
                    }
                  />
                ))}

                {showTotal && (
                  <Line
                    type="monotone"
                    dataKey={(data: any) =>
                      data.distance +
                      data.polygon +
                      data.elevation +
                      data.circle +
                      data.sector_rf
                    }
                    stroke="#000000"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    name="Total"
                  />
                )}
              </ComposedChart>
            ) : viewType === "area" ? (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: "11px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "11px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />

                {(Object.entries(CHART_COLORS) as [string, string][]).map(([key, color]) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="1"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.6}
                    name={
                      key.charAt(0).toUpperCase() +
                      key.slice(1).replace("_", " ")
                    }
                  />
                ))}
              </AreaChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: "11px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "11px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />

                {(Object.entries(CHART_COLORS) as [string, string][]).map(([key, color]) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="1"
                    fill={color}
                    name={
                      key.charAt(0).toUpperCase() +
                      key.slice(1).replace("_", " ")
                    }
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
            Distribution
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={(Object.values(CHART_COLORS) as string[])[index]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2 mt-4">
            {pieData.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: (Object.values(CHART_COLORS) as string[])[i] }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageTrendsChart;

