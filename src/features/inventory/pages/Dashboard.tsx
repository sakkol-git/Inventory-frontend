// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY DASHBOARD — Composition Root
// ═══════════════════════════════════════════════════════════════════════════
//
// This file contains ZERO business logic and ZERO hardcoded UI.
// It is the thinnest possible shell: hook → config → renderer.
//
// To add a new widget:
//   1. Add a new member to the InventoryWidget union     (dashboard/types.ts)
//   2. Create a renderer component                       (dashboard/widgets/)
//   3. Register it in WIDGET_REGISTRY                    (dashboard/widgetRegistry.ts)
//   4. Add the config entry in useInventoryDashboard     (dashboard/useInventoryDashboard.tsx)
//   — No changes needed here.
// ═══════════════════════════════════════════════════════════════════════════

import AppLayout from "@/core/layouts/AppLayout";
import InventoryDashboardRenderer from "./dashboard/InventoryDashboardRenderer";
import { useInventoryDashboard } from "./dashboard/useInventoryDashboard";

const Dashboard = () => {
  const { config } = useInventoryDashboard();

  return (
    <AppLayout>
      <InventoryDashboardRenderer config={config} />
    </AppLayout>
  );
};

export default Dashboard;