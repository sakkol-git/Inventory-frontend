/* ═══════════════════════════════════════════════════════════════════════════
 * Achievements — composition root for achievement definitions and assignments.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Award } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { ListPage } from "@/shared/components/ListPage";

import { AchievementAssignmentsDialog } from "./AchievementAssignmentsDialog";
import { AchievementFormDialog } from "./AchievementFormDialog";
import { AchievementsTable } from "./AchievementsTable";
import { AchievementGrid } from "./AchievementGrid";
import { useAchievementsView } from "./useAchievementsView";

const Achievements = () => {
  const view = useAchievementsView();

  return (
    <ListPage
      icon={Award}
      title="Achievements"
      description="Manage achievement definitions"
      addLabel="Add Achievement"
      onAdd={view.openCreateForm}
      stats={view.quickStats}
      searchPlaceholder="Search achievements..."
      searchQuery={view.searchQuery}
      onSearchChange={view.updateSearchQuery}
      viewMode={view.viewMode}
      onViewModeChange={view.switchViewMode}
      items={view.achievements}
      meta={view.meta}
      onPageChange={view.setPage}
      isLoading={view.isLoading}
      isError={view.isError}
      emptyTitle="No achievements found"
      emptyDescription="Try adjusting your search or create a new achievement."
      renderGrid={(items) => (
        <AchievementGrid
          items={items}
          onManageAssignments={view.openAssignments}
          onEdit={view.openEditForm}
          onDelete={view.requestDeleteAchievement}
          onNavigate={view.navigateToDetail}
        />
      )}
      renderTable={(items) => (
        <AchievementsTable
          achievements={items}
          onManageAssignments={view.openAssignments}
          onEdit={view.openEditForm}
          onDelete={view.requestDeleteAchievement}
        />
      )}
    >
      <AchievementFormDialog
        mode="create"
        open={view.createOpen}
        form={view.createForm}
        onOpenChange={view.setCreateOpen}
        onSubmit={view.handleCreate}
        isPending={view.createMutation.isPending}
      />

      <AchievementFormDialog
        mode="edit"
        open={view.editItem !== null}
        form={view.editForm}
        onOpenChange={(open) => {
          if (!open) view.closeEditForm();
        }}
        onSubmit={view.handleEdit}
        isPending={view.updateMutation.isPending}
      />

      <AchievementAssignmentsDialog
        open={view.assignmentAchievementId !== null}
        achievement={view.assignmentAchievement}
        availableUsers={view.availableUserOptions}
        assignedUsers={view.assignedUsersWithNames}
        selectedUserId={view.selectedUserId}
        onSelectedUserChange={view.setSelectedUserId}
        userSearch={view.userSearch}
        onUserSearchChange={view.setUserSearch}
        onAssign={view.handleAssign}
        onRequestRevoke={view.requestRevokeAchievement}
        onOpenChange={(open) => {
          if (!open) view.closeAssignments();
        }}
        isAssignPending={view.assignMutation.isPending}
      />

      <ConfirmDialog
        open={view.deleteId !== null}
        onOpenChange={(open) => {
          if (!open) view.setDeleteId(null);
        }}
        onConfirm={view.confirmDeleteAchievement}
        title="Delete Achievement"
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isPending={view.deleteMutation.isPending}
      />

      <ConfirmDialog
        open={view.revokeUserId !== null}
        onOpenChange={(open) => {
          if (!open) view.setRevokeUserId(null);
        }}
        onConfirm={view.confirmRevokeAchievement}
        title="Revoke Achievement"
        description="This will remove the achievement from the selected user."
        confirmLabel="Revoke"
        variant="destructive"
        isPending={view.revokeMutation.isPending}
      />
    </ListPage>
  );
};

export default Achievements;