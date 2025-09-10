"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

import { cn } from "../../lib/utils"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex aspect-video justify-center text-xs [&_.recharts-pie-label-text]:fill-foreground [&_.recharts-pie-label-line]:stroke-foreground [&_.recharts-tooltip-content]:rounded-md [&_.recharts-tooltip-content]:border [&_.recharts-tooltip-content]:bg-background [&_.recharts-tooltip-content]:p-2 [&_.recharts-tooltip-content]:shadow-md",
      className
    )}
    {...props}
  />
))
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-background p-2 shadow-md",
      className
    )}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: any[]
    label?: string
    hideLabel?: boolean
  }
>(({ active, payload, label, hideLabel = false, className, ...props }, ref) => {
  if (active && payload && payload.length) {
    return (
      <ChartTooltip ref={ref} className={className} {...props}>
        {!hideLabel && label && (
          <div className="text-sm font-medium">{label}</div>
        )}
        <div className="space-y-1">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.name}</span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </ChartTooltip>
    )
  }

  return null
})
ChartTooltipContent.displayName = "ChartTooltipContent"

interface ChartLegendProps {
  payload?: any[]
  className?: string
}

const ChartLegend = React.forwardRef<HTMLDivElement, ChartLegendProps>(
  ({ payload, className, ...props }, ref) => {
    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap justify-center gap-4", className)}
        {...props}
      >
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    )
  }
)
ChartLegend.displayName = "ChartLegend"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
}