import React from "react";
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  data: PieChartData[];
  title?: string;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p className="text-sm text-gray-600">
          Value: <span className="font-semibold">{payload[0].value}</span>
        </p>
        <p className="text-sm text-gray-600">
          Percentage: <span className="font-semibold">
            {((payload[0].value / payload.reduce((sum: number, item: any) => sum + item.value, 0)) * 100).toFixed(1)}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export function PieChart({
  data,
  title,
  className = "",
  showLegend = true,
  showTooltip = true,
  innerRadius = 0,
  outerRadius = 120,
}: PieChartProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          )}
        </RechartsChart>
      </ResponsiveContainer>
    </div>
  );
}