/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Application Router — Single source of truth for all routes.
 *
 * Every page is lazy-loaded via React.lazy() + Suspense.
 * App.tsx is reduced to provider wiring only.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ProtectedRoute } from "@/core/auth";
import { useAuth } from "@/core/auth/useAuth";
import { lazyRoute } from "@/shared/lib/lazy-routes";
import { Navigate, Route, Routes } from "react-router-dom";

function BorrowRecordTabRedirect() {
  const { isLoading, isAuthenticated, isRole } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isRole("admin") && !isRole("lab_manager")) {
    return <Navigate to="/inventory" replace />;
  }

  return <Navigate to="/inventory/borrow-records" replace />;
}

// ─── Public ──────────────────────────────────────────────────────────────────
const LoginPage = lazyRoute(() => import("@/core/auth/pages/LoginPage"), {
  displayName: "LoginPage",
});
const RegisterPage = lazyRoute(() => import("@/core/auth/pages/RegisterPage"), {
  displayName: "RegisterPage",
});
const NotFound = lazyRoute(() => import("@/pages/NotFound"), {
  displayName: "NotFound",
});

// ─── Admin ───────────────────────────────────────────────────────────────────
const RoleManagement = lazyRoute(
  () => import("@/features/admin/pages/RoleManagement"),
  { displayName: "RoleManagement" },
);
const PermissionManagement = lazyRoute(
  () => import("@/features/admin/pages/PermissionManagement"),
  { displayName: "PermissionManagement" },
);
const ActivityLog = lazyRoute(
  () => import("@/features/admin/pages/ActivityLog"),
  { displayName: "ActivityLog" },
);

// ─── Inventory: Listings ─────────────────────────────────────────────────────
const Dashboard = lazyRoute(
  () => import("@/features/inventory/pages/dashboard/Dashboard"),
  { displayName: "Dashboard" },
);
const PlantSpecies = lazyRoute(
  () => import("@/features/inventory/pages/plant-species/PlantSpecies"),
  { displayName: "PlantSpecies" },
);
const PlantStock = lazyRoute(
  () => import("@/features/inventory/pages/plant-stock/PlantStock"),
  { displayName: "PlantStock" },
);
const PlantVarieties = lazyRoute(
  () => import("@/features/inventory/pages/plant-variety/PlantVarieties"),
  { displayName: "PlantVarieties" },
);
const PlantSamples = lazyRoute(
  () => import("@/features/inventory/pages/plant-sample/PlantSamples"),
  { displayName: "PlantSamples" },
);
const Chemicals = lazyRoute(
  () => import("@/features/inventory/pages/chemical/Chemicals"),
  { displayName: "Chemicals" },
);
const Equipment = lazyRoute(
  () => import("@/features/inventory/pages/equipment/Equipment"),
  { displayName: "Equipment" },
);
// const ChemicalBatches = lazyRoute(
//   () => import("@/features/inventory/pages/chemical/ChemicalBatches"),
//   { displayName: "ChemicalBatches" },
// );
const Transactions = lazyRoute(
  () => import("@/features/inventory/pages/transaction/Transactions"),
  { displayName: "Transactions" },
);
const BorrowRecords = lazyRoute(
  () => import("@/features/inventory/pages/borrow-record/BorrowRecords"),
  { displayName: "BorrowRecords" },
);
// const MaintenanceRecords = lazyRoute(
//   () => import("@/features/inventory/pages/equipment/MaintenanceRecords"),
//   { displayName: "MaintenanceRecords" },
// );
const Achievements = lazyRoute(
  () => import("@/features/inventory/pages/Achievments/Achievements"),
  { displayName: "Achievements" },
);
const UserDocuments = lazyRoute(
  () => import("@/features/inventory/pages/user-documents/UserDocuments"),
  { displayName: "UserDocuments" },
);
const Users = lazyRoute(() => import("@/features/admin/pages/Users"), {
  displayName: "Users",
});
const UserProfile = lazyRoute(
  () => import("@/features/inventory/pages/user-profile/UserProfile"),
  { displayName: "UserProfile" },
);

// ─── Inventory: Details ──────────────────────────────────────────────────────
const PlantSpeciesDetail = lazyRoute(
  () => import("@/features/inventory/pages/plant-species/PlantSpeciesDetail"),
  { displayName: "PlantSpeciesDetail" },
);
const PlantStockDetail = lazyRoute(
  () => import("@/features/inventory/pages/plant-stock/PlantStockDetail"),
  { displayName: "PlantStockDetail" },
);
const PlantVarietyDetail = lazyRoute(
  () => import("@/features/inventory/pages/plant-variety/PlantVarietyDetail"),
  { displayName: "PlantVarietyDetail" },
);
const PlantSampleDetail = lazyRoute(
  () => import("@/features/inventory/pages/plant-sample/PlantSampleDetail"),
  { displayName: "PlantSampleDetail" },
);
const ChemicalDetail = lazyRoute(
  () => import("@/features/inventory/pages/chemical/ChemicalDetail"),
  { displayName: "ChemicalDetail" },
);
const EquipmentDetail = lazyRoute(
  () => import("@/features/inventory/pages/equipment/EquipmentDetail"),
  { displayName: "EquipmentDetail" },
);

// ─── Reports ─────────────────────────────────────────────────────────────────
const ReportsDashboard = lazyRoute(
  () => import("@/features/reports/pages/ReportsDashboard"),
  { displayName: "ReportsDashboard" },
);
const InventoryReportPage = lazyRoute(
  () => import("@/features/reports/pages/InventoryReportPage"),
  { displayName: "InventoryReportPage" },
);
const ChemicalUsageReportPage = lazyRoute(
  () => import("@/features/reports/pages/ChemicalUsageReportPage"),
  { displayName: "ChemicalUsageReportPage" },
);
const ExpiredItemsReportPage = lazyRoute(
  () => import("@/features/reports/pages/ExpiredItemsReportPage"),
  { displayName: "ExpiredItemsReportPage" },
);
const BorrowedItemsReportPage = lazyRoute(
  () => import("@/features/reports/pages/BorrowedItemsReportPage"),
  { displayName: "BorrowedItemsReportPage" },
);
const UserActivityReportPage = lazyRoute(
  () => import("@/features/reports/pages/UserActivityReportPage"),
  { displayName: "UserActivityReportPage" },
);

// ─── Helper ──────────────────────────────────────────────────────────────────
function Protected({
  children,
  permission,
  requiredRole,
}: {
  children: React.ReactNode;
  permission?: string;
  requiredRole?: string;
}) {
  return (
    <ProtectedRoute permission={permission} requiredRole={requiredRole}>
      {children}
    </ProtectedRoute>
  );
}

// ─── Route Tree ──────────────────────────────────────────────────────────────
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/inventory" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Inventory */}
      <Route
        path="/inventory"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/inventory/plant-species"
        element={
          <Protected>
            <PlantSpecies />
          </Protected>
        }
      />
      <Route
        path="/inventory/plant-stock"
        element={
          <Protected>
            <PlantStock />
          </Protected>
        }
      />
      <Route
        path="/inventory/plant-varieties"
        element={
          <Protected>
            <PlantVarieties />
          </Protected>
        }
      />
      <Route
        path="/inventory/plant-samples"
        element={
          <Protected>
            <PlantSamples />
          </Protected>
        }
      />
      <Route
        path="/inventory/plants"
        element={<Navigate to="/inventory/plant-species" replace />}
      />
      <Route
        path="/inventory/products/species"
        element={<Navigate to="/inventory/plant-species" replace />}
      />
      <Route
        path="/inventory/chemicals"
        element={
          <Protected>
            <Chemicals />
          </Protected>
        }
      />
      <Route
        path="/inventory/equipment"
        element={
          <Protected>
            <Equipment />
          </Protected>
        }
      />
      <Route
        path="/inventory/transactions"
        element={
          <Protected permission="transactions.view">
            <Transactions />
          </Protected>
        }
      />
      <Route
        path="/inventory/borrow-records"
        element={
          <Protected>
            <BorrowRecords />
          </Protected>
        }
      />
      <Route
        path="/inventory/borrow-records/pending"
        element={<BorrowRecordTabRedirect />}
      />
      <Route
        path="/inventory/borrow-records/overdue"
        element={<BorrowRecordTabRedirect />}
      />
      {/* <Route
        path="/inventory/chemical-batches"
        element={
          <Protected permission="chemical_batches.view">
            <ChemicalBatches />
          </Protected>
        }
      /> */}
      {/* <Route
        path="/inventory/maintenance-records"
        element={
          <Protected permission="maintenance.view">
            <MaintenanceRecords />
          </Protected>
        }
      /> */}
      <Route
        path="/inventory/achievements"
        element={
          <Protected permission="achievements.view">
            <Achievements />
          </Protected>
        }
      />
      <Route
        path="/inventory/documents"
        element={
          <Protected permission="documents.view">
            <UserDocuments />
          </Protected>
        }
      />
      <Route
        path="/admin/users"
        element={
          <Protected requiredRole="admin">
            <Users />
          </Protected>
        }
      />
      <Route
        path="/inventory/profile"
        element={
          <Protected>
            <UserProfile />
          </Protected>
        }
      />

      {/* Inventory Details — Consistent URLs */}
      <Route
        path="/inventory/plant-species/:id"
        element={
          <Protected>
            <PlantSpeciesDetail />
          </Protected>
        }
      />
      <Route
        path="/inventory/plant-stock/:id"
        element={
          <Protected>
            <PlantStockDetail />
          </Protected>
        }
      />
      <Route
        path="/inventory/plant-varieties/:id"
        element={
          <Protected>
            <PlantVarietyDetail />
          </Protected>
        }
      />
      <Route
        path="/inventory/plant-samples/:id"
        element={
          <Protected>
            <PlantSampleDetail />
          </Protected>
        }
      />
      <Route
        path="/inventory/chemicals/:id"
        element={
          <Protected>
            <ChemicalDetail />
          </Protected>
        }
      />
      <Route
        path="/inventory/equipment/:id"
        element={
          <Protected>
            <EquipmentDetail />
          </Protected>
        }
      />

      {/* Legacy detail routes — kept for backward compatibility */}
      <Route
        path="/inventory/products/species/:id"
        element={
          <Protected>
            <PlantSpeciesDetail />
          </Protected>
        }
      />
      <Route
        path="/inventory/products/stock/:id"
        element={
          <Protected>
            <PlantStockDetail />
          </Protected>
        }
      />
      <Route
        path="/inventory/products/varieties/:id"
        element={
          <Protected>
            <PlantVarietyDetail />
          </Protected>
        }
      />
      <Route
        path="/inventory/products/samples/:id"
        element={
          <Protected>
            <PlantSampleDetail />
          </Protected>
        }
      />
      <Route
        path="/inventory/products/chemicals/:id"
        element={
          <Protected>
            <ChemicalDetail />
          </Protected>
        }
      />
      <Route
        path="/inventory/products/equipment/:id"
        element={
          <Protected>
            <EquipmentDetail />
          </Protected>
        }
      />

      {/* Reports */}
      <Route
        path="/inventory/reports"
        element={
          <Protected permission="reports.view">
            <ReportsDashboard />
          </Protected>
        }
      />
      <Route
        path="/inventory/reports/inventory"
        element={
          <Protected permission="reports.view">
            <InventoryReportPage />
          </Protected>
        }
      />
      <Route
        path="/inventory/reports/chemical-usage"
        element={
          <Protected permission="reports.view">
            <ChemicalUsageReportPage />
          </Protected>
        }
      />
      <Route
        path="/inventory/reports/expired-items"
        element={
          <Protected permission="reports.view">
            <ExpiredItemsReportPage />
          </Protected>
        }
      />
      <Route
        path="/inventory/reports/borrowed-items"
        element={
          <Protected permission="reports.view">
            <BorrowedItemsReportPage />
          </Protected>
        }
      />
      <Route
        path="/inventory/reports/user-activity"
        element={
          <Protected permission="reports.view">
            <UserActivityReportPage />
          </Protected>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/roles"
        element={
          <Protected requiredRole="admin">
            <RoleManagement />
          </Protected>
        }
      />
      <Route
        path="/admin/permissions"
        element={
          <Protected requiredRole="admin">
            <PermissionManagement />
          </Protected>
        }
      />
      <Route
        path="/admin/activity-log"
        element={
          <Protected requiredRole="admin">
            <ActivityLog />
          </Protected>
        }
      />

      {/* Legacy Redirects */}
      <Route
        path="/plant-species"
        element={<Navigate to="/inventory/plant-species" replace />}
      />
      <Route
        path="/plant-batches"
        element={<Navigate to="/inventory/plant-stock" replace />}
      />
      <Route
        path="/chemicals"
        element={<Navigate to="/inventory/chemicals" replace />}
      />
      <Route
        path="/equipment"
        element={<Navigate to="/inventory/equipment" replace />}
      />
      <Route
        path="/transactions"
        element={<Navigate to="/inventory/transactions" replace />}
      />
      <Route
        path="/users"
        element={<Navigate to="/admin/users" replace />}
      />
      <Route
        path="/products/species/:id"
        element={<Navigate to="/inventory/products/species/:id" replace />}
      />
      <Route
        path="/products/batches/:id"
        element={<Navigate to="/inventory/products/stock/:id" replace />}
      />
      <Route
        path="/products/chemicals/:id"
        element={<Navigate to="/inventory/products/chemicals/:id" replace />}
      />
      <Route
        path="/products/equipment/:id"
        element={<Navigate to="/inventory/products/equipment/:id" replace />}
      />
      <Route
        path="/inventory/products/equipment"
        element={<Navigate to="/inventory/equipment" replace />}
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
