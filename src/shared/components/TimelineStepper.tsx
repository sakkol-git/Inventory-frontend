import { cn } from "@/shared/lib/utils";
import { Check, type LucideIcon } from "lucide-react";

export interface TimelineStep {
  id: string | number;
  title: string;
  description?: string;
  icon?: LucideIcon;
  status: "completed" | "current" | "upcoming";
  timestamp?: string;
}

interface TimelineStepperProps {
  steps: TimelineStep[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const STATUS_STYLES = {
  completed: {
    circle: "bg-primary text-primary-foreground border-primary",
    line: "bg-primary",
    text: "text-foreground",
  },
  current: {
    circle: "bg-primary/10 text-primary border-primary ring-4 ring-primary/20",
    line: "bg-border",
    text: "text-primary font-semibold",
  },
  upcoming: {
    circle: "bg-muted text-muted-foreground border-border",
    line: "bg-border",
    text: "text-muted-foreground",
  },
};

/**
 * Multi-step timeline / stepper component.
 * Supports both horizontal and vertical orientations.
 */
const TimelineStepper = ({
  steps,
  orientation = "horizontal",
  className,
}: TimelineStepperProps) => {
  if (orientation === "vertical") {
    return (
      <div className={cn("flex flex-col", className)}>
        {steps.map((step, i) => {
          const styles = STATUS_STYLES[step.status];
          const StepIcon = step.icon;
          const isLast = i === steps.length - 1;

          return (
            <div key={step.id} className="flex gap-4">
              {/* Icon column */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    styles.circle
                  )}
                >
                  {step.status === "completed" ? (
                    <Check className="h-4 w-4" />
                  ) : StepIcon ? (
                    <StepIcon className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}
                </div>
                {!isLast && (
                  <div className={cn("w-0.5 flex-1 min-h-[2rem]", styles.line)} />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-6", isLast && "pb-0")}>
                <p className={cn("text-sm", styles.text)}>{step.title}</p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                )}
                {step.timestamp && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {step.timestamp}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal
  return (
    <div className={cn("flex items-start gap-0", className)}>
      {steps.map((step, i) => {
        const styles = STATUS_STYLES[step.status];
        const StepIcon = step.icon;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  styles.circle
                )}
              >
                {step.status === "completed" ? (
                  <Check className="h-4 w-4" />
                ) : StepIcon ? (
                  <StepIcon className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>
              <p className={cn("text-xs mt-2 text-center max-w-[80px]", styles.text)}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-[10px] text-muted-foreground text-center max-w-[80px] mt-0.5">
                  {step.description}
                </p>
              )}
            </div>

            {!isLast && (
              <div className={cn("h-0.5 flex-1 mt-4 mx-2", styles.line)} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TimelineStepper;
