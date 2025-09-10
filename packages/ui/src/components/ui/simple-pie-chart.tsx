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
  outerRadius = 120,
}: SimplePieChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="mx-auto aspect-square max-h-[300px]">
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
                  height={36}
                />
              )}
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}