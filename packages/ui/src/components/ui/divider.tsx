import * as React from "react";
import { cn } from "../../lib/utils";

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  variant?: "solid" | "dashed" | "dotted";
  emphasis?: "default" | "muted";
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ className, variant = "solid", emphasis = "default", ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          "border-0 border-t",
          variant === "dashed" && "border-t-dashed",
          variant === "dotted" && "border-t-dotted",
          emphasis === "muted" ? "border-border/60" : "border-border",
          className,
        )}
        {...props}
      />
    );
  },
);

Divider.displayName = "Divider";

export default Divider;

