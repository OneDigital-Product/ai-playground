import { Badge } from "@repo/ui/components/ui/badge";
import { cn } from "@repo/ui/lib/utils";

type ComplexityBand = "Minimal" | "Low" | "Medium" | "High";

interface ComplexityBadgeProps {
  band: ComplexityBand;
  score: number;
  showScore?: boolean;
  className?: string;
}

const complexityColors: Record<ComplexityBand, string> = {
  Minimal: "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200",
  Low: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200",
  High: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200",
};

export function ComplexityBadge({ 
  band, 
  score, 
  showScore = false, 
  className 
}: ComplexityBadgeProps) {
  const colorClass = complexityColors[band];
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        colorClass,
        "font-medium",
        className
      )}
    >
      {band}
      {showScore && (
        <span className="ml-1 text-xs opacity-75">
          Score: {score}
        </span>
      )}
    </Badge>
  );
}