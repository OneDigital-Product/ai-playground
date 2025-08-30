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
        spellCheck={spellCheck ?? false} // Explicitly set to prevent browser extension interference
        autoComplete={autoComplete ?? "off"} // Prevent autocomplete interference
        suppressHydrationWarning={suppressHydrationWarning} // Suppress hydration warnings for browser extension attributes
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
