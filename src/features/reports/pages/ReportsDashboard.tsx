/* ═══════════════════════════════════════════════════════════════════════════
 * Reports Dashboard — Links to all available reports.
 * ═══════════════════════════════════════════════════════════════════════════ */

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import AppLayout from "@/core/layouts/AppLayout";
import PageHeader from "@/shared/components/PageHeader";
import {
    AlertTriangle,
    ArrowLeftRight,
    BarChart3,
    FlaskConical,
    Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const REPORTS = [
  {
    title: "Inventory Report",
    description: "Overview of all plant species, chemicals, and equipment",
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    path: "/inventory/reports/inventory",
  },
  {
    title: "Chemical Usage",
    description: "Chemical usage logs grouped by chemical over a date range",
    icon: <FlaskConical className="h-6 w-6 text-amber-500" />,
    path: "/inventory/reports/chemical-usage",
  },
  {
    title: "Expired Items",
    description: "Expired chemicals and chemical batches requiring attention",
    icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
    path: "/inventory/reports/expired-items",
  },
  {
    title: "Borrowed Items",
    description: "Active, pending, and overdue borrow records",
    icon: <ArrowLeftRight className="h-6 w-6 text-blue-500" />,
    path: "/inventory/reports/borrowed-items",
  },
  {
    title: "User Activity",
    description: "Per-user transaction and activity statistics",
    icon: <Users className="h-6 w-6 text-green-500" />,
    path: "/inventory/reports/user-activity",
  },
];

const ReportsDashboard = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="Reports"
          description="Generate and export lab reports"
          icon={BarChart3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORTS.map((report) => (
            <Card
              key={report.path}
              className="cursor-pointer hover:shadow-md transition-shadow duration-150"
              onClick={() => navigate(report.path)}
            >
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">{report.icon}</div>
                <div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {report.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsDashboard;
