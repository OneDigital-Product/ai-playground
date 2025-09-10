"use client"

import * as React from "react"
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { ChartContainer, ChartTooltipContent, ChartLegend } from "./chart"

export interface SimplePieChartData {
  name: string
  value: number
  color: string
}

export interface SimplePieChartProps {
  data: SimplePieChartData[]
  title: string
  className?: string
  showLegend?: boolean
  showTooltip?: boolean
  innerRadius?: number
  outerRadius?: number
  legendHeight?: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <ChartTooltipContent
        active={active}
        payload={[
          {
            name: data.name,
            value: `${data.value}%`,
            color: data.payload.color,
          },
        ]}
      />
    )
  }
  return null
}

export function SimplePieChart({
  data,
  title,
  className = "",
  showLegend = true,
  showTooltip = true,
  innerRadius = 0,
  // Slightly larger radius with added container height for boardroom readability
  outerRadius = 140,
  // Reserve more space for multi-row legends
  legendHeight = 120,
}: SimplePieChartProps) {
  return (
    <Card density="dense" className={className}>
      <CardHeader density="compact" className="pb-2">
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent density="compact">
        {/*
          Tailwind v4 spacing guidance: prefer compact density at the
          component level and ensure the inner chart container has
          enough height to accommodate the legend rendered by Recharts.
          Increasing max height here prevents legend overlap without
          forcing page-level spacing changes.
        */}
        {/* Per Tailwind v4 guide: set explicit height at component layer; no fixed aspect ratio */}
        <ChartContainer className="mx-auto h-[500px] md:h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
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
                  content={<ChartLegend />}
                  verticalAlign="bottom"
                  height={legendHeight}
                />
              )}
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
