import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Input Component
 *
 * Enhanced input component that prevents hydration mismatches caused by browser extensions.
 * Explicitly sets attributes that are commonly modified by browser extensions to ensure
 * consistency between server and client rendering.
 */

export interface InputProps extends React.ComponentProps<"input"> {
  suppressHydrationWarning?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, spellCheck, autoComplete, suppressHydrationWarning = true, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type || "text"}
        data-slot="input"
        spellCheck={spellCheck ?? false}
        autoComplete={autoComplete ?? "off"}
        suppressHydrationWarning={suppressHydrationWarning}
        className={cn(
          // Match shadcn/ui v4 defaults as closely as possible
          "border-input placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex h-9 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
