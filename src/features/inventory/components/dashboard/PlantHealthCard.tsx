import { Leaf } from "lucide-react";

const PlantHealthCard = () => {
  const total = 1247;
  const healthy = 1089;
  const failed = 42;
  const growing = total - healthy - failed;
  
  const healthPercentage = Math.round((healthy / total) * 100);

  const stats = [
    { label: "Healthy", value: healthy, color: "bg-primary", textColor: "text-primary" },
    { label: "Growing", value: growing, color: "bg-warning", textColor: "text-warning" },
    { label: "Failed", value: failed, color: "bg-destructive", textColor: "text-destructive" },
  ];

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="section-header">
        <Leaf className="h-5 w-5 text-muted-foreground" />
        <h3 className="section-title text-foreground">Plant Inventory Health</h3>
      </div>

      <div className="flex items-center gap-8">
        {/* Circular Progress */}
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${healthPercentage * 2.64} 264`}
              className="text-primary transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-medium text-foreground tabular-nums">{healthPercentage}%</span>
            <span className="text-xs font-medium text-muted-foreground tracking-wide">Health</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="rounded-xl p-3 text-center hover:bg-muted/40 transition-colors"
            >
              <div className={`w-3 h-3 ${stat.color} rounded-full mx-auto mb-2`} />
              <p className={`text-xl font-medium tabular-nums ${stat.textColor}`}>
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-muted-foreground tracking-wide mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlantHealthCard;