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
      // Do not force aspect ratio; let consumers set explicit height per Tailwind v4 guide
      "flex justify-center text-sm md:text-base [&_.recharts-pie-label-text]:fill-foreground [&_.recharts-pie-label-line]:stroke-foreground [&_.recharts-tooltip-content]:rounded-md [&_.recharts-tooltip-content]:border [&_.recharts-tooltip-content]:bg-background [&_.recharts-tooltip-content]:p-2 [&_.recharts-tooltip-content]:shadow-md",
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
>(({ active, payload, label, hideLabel = false, className }, ref) => {
  if (active && payload && payload.length) {
    return (
      <ChartTooltip ref={ref} className={className}>
        {!hideLabel && label && (
          <div className="text-base md:text-lg font-medium">{label}</div>
        )}
        <div className="space-y-1">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-base md:text-lg">{item.name}</span>
              <span className="text-base md:text-lg font-medium">{item.value}</span>
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
  ({ payload, className }, ref) => {
    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn("mt-1 flex flex-wrap justify-center gap-4 text-base md:text-lg", className)}
      >
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-base md:text-lg text-muted-foreground">{item.value}</span>
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
