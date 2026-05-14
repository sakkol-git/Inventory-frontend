import { cn } from "@/shared/lib/utils";
import { Calendar } from "lucide-react";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// 6 weeks of activity data (value = number of transactions/actions that day)
const activityData: number[][] = [
  [3, 8, 5, 12, 7, 1, 0],
  [6, 10, 4, 9, 15, 2, 0],
  [5, 7, 11, 6, 8, 3, 1],
  [8, 14, 9, 7, 10, 2, 0],
  [4, 6, 13, 11, 9, 1, 0],
  [7, 12, 8, 15, 6, 4, 2],
];

const weekLabels = ["W1", "W2", "W3", "W4", "W5", "W6"];

const getIntensity = (value: number) => {
  if (value === 0) return "bg-muted border-border";
  if (value <= 3) return "bg-primary/20";
  if (value <= 7) return "bg-primary/40 border-primary/40";
  if (value <= 11) return "bg-primary/60 border-primary/50";
  return "bg-primary border-primary/80";
};

const ActivityHeatmap = () => {
  const totalActions = activityData.flat().reduce((sum, v) => sum + v, 0);
  const maxDay = Math.max(...activityData.flat());
  const activeDays = activityData.flat().filter((v) => v > 0).length;

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="section-title text-foreground">Lab Activity</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              6-week transaction heatmap
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium text-foreground tabular-nums">{totalActions}</p>
          <p className="text-xs font-medium text-muted-foreground">
            total actions
          </p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-3">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-6">
          {weekDays.map((day) => (
            <div
              key={day}
              className="h-7 flex items-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1">
          {/* Week labels */}
          <div className="flex gap-1 mb-1">
            {weekLabels.map((label) => (
              <div
                key={label}
                className="flex-1 text-center text-xs font-medium text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-rows-7 gap-1">
            {weekDays.map((_, dayIndex) => (
              <div key={dayIndex} className="flex gap-1">
                {activityData.map((week, weekIndex) => {
                  const value = week[dayIndex];
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={cn(
                        "flex-1 h-7 border transition-all hover:scale-110 cursor-pointer flex items-center justify-center",
                        getIntensity(value)
                      )}
                      title={`${weekDays[dayIndex]} W${weekIndex + 1}: ${value} actions`}
                    >
                      {value > 0 && (
                        <span className="text-[9px] font-medium tabular-nums text-foreground/70">
                          {value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground tabular-nums">{activeDays}</p>
          <p className="text-xs font-medium text-muted-foreground">Active Days</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground tabular-nums">{maxDay}</p>
          <p className="text-xs font-medium text-muted-foreground">Peak Day</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground tabular-nums">
            {(totalActions / activeDays).toFixed(1)}
          </p>
          <p className="text-xs font-medium text-muted-foreground">Avg/Day</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-xs font-medium text-muted-foreground mr-1">Less</span>
        {[0, 2, 5, 9, 13].map((v) => (
          <div
            key={v}
            className={cn("w-4 h-4 border", getIntensity(v))}
          />
        ))}
        <span className="text-xs font-medium text-muted-foreground ml-1">More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
