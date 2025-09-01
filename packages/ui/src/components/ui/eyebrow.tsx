import * as React from "react";
import { cn } from "../../lib/utils";

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  leadingSlash?: boolean;
  tone?: "default" | "muted" | "accent";
}

export const Eyebrow = React.forwardRef<HTMLSpanElement, EyebrowProps>(
  ({ className, leadingSlash = false, tone = "muted", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em]",
          tone === "muted" && "text-muted-foreground",
          tone === "accent" && "text-primary",
          tone === "default" && "text-foreground/80",
          className,
        )}
        {...props}
      >
        {leadingSlash ? <span aria-hidden="true">/</span> : null}
        <span>{children}</span>
      </span>
    );
  },
);

Eyebrow.displayName = "Eyebrow";

export default Eyebrow;

