/* ═══════════════════════════════════════════════════════════════════════════
 * Achievements — composition root for achievement definitions and assignments.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { Award, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import EmptyState from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import PageHeader from "@/shared/components/PageHeader";
import AppLayout from "@/core/layouts/AppLayout";

import { AchievementAssignmentsDialog } from "./AchievementAssignmentsDialog";
import { AchievementFormDialog } from "./AchievementFormDialog";
import { AchievementsTable } from "./AchievementsTable";
import { useAchievementsView } from "./useAchievementsView";

const Achievements = () => {
  const view = useAchievementsView();

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="Achievements"
          description="Manage achievement definitions"
          icon={Award}
          actions={
            <Button className="gap-2" onClick={view.openCreateForm}>
              <Plus className="h-4 w-4" />
              Add Achievement
            </Button>
          }
        />

        {view.isLoading ? (
          <LoadingState
            variant="skeleton"
            rows={5}
            text="Loading achievements..."
          />
        ) : view.isError ? (
          <EmptyState
            icon={Award}
            title="Failed to load achievements"
            description="Could not connect to the server. Please check your connection and try again."
          />
        ) : view.achievements.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No achievements defined"
            description="Create your first achievement to get started."
          />
        ) : (
          <AchievementsTable
            achievements={view.achievements}
            onManageAssignments={view.openAssignments}
            onEdit={view.openEditForm}
            onDelete={view.requestDeleteAchievement}
          />
        )}
      </div>

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
    </AppLayout>
  );
};

export default Achievements;