import * as React from "react"

import { cn } from "../../lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm",
  {
    variants: {
      density: {
        comfortable: "gap-6 py-6",
        compact: "gap-4 py-5",
        dense: "gap-3 py-4",
        auto: "", // No default spacing - let app control it
      },
    },
    defaultVariants: {
      density: "auto", // Changed default to "auto" - apps control spacing
    },
  }
)

const cardHeaderVariants = cva(
  "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
  {
    variants: {
      density: {
        // Keep existing default behavior: add pb only when there's a border
        comfortable: "[.border-b]:pb-6",
        // Compact: add a consistent bottom padding and also reduce when bordered
        compact: "pb-4 [.border-b]:pb-4",
      },
    },
    defaultVariants: { density: "comfortable" },
  }
)

const cardContentVariants = cva("px-6", {
  variants: {
    density: {
      comfortable: "",
      compact: "",
    },
  },
  defaultVariants: { density: "comfortable" },
})

const cardFooterVariants = cva("flex items-center px-6", {
  variants: {
    density: {
      comfortable: "[.border-t]:pt-6",
      compact: "pt-4 [.border-t]:pt-4",
    },
  },
  defaultVariants: { density: "comfortable" },
})

interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {}

function Card({ className, density, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ density }), className)}
      {...props}
    />
  )
}

interface CardHeaderProps extends React.ComponentProps<"div">, VariantProps<typeof cardHeaderVariants> {}
function CardHeader({ className, density, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderVariants({ density }), className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

interface CardContentProps extends React.ComponentProps<"div">, VariantProps<typeof cardContentVariants> {}
function CardContent({ className, density, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ density }), className)}
      {...props}
    />
  )
}

interface CardFooterProps extends React.ComponentProps<"div">, VariantProps<typeof cardFooterVariants> {}
function CardFooter({ className, density, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(cardFooterVariants({ density }), className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
