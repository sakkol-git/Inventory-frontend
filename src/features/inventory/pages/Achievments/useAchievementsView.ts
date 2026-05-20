import { useAchievementById, useAchievements, useAssignAchievement, useCreateAchievement, useDeleteAchievement, useRevokeAchievement, useUpdateAchievement } from "@/features/inventory/services/achievementService";
import { useUserList, userService } from "@/features/inventory/services/userService";
import type { Achievement } from "@/shared/types/index";
import { storeAchievementSchema, type StoreAchievementPayload } from "@/shared/types/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type AssignmentUserView = {
  id: number;
  name: string | null;
  email: string | null;
};

function getAssignedUserIds(achievement: Achievement | null): number[] {
  if (!achievement) return [];
  if (achievement.assigned_user_ids?.length) return achievement.assigned_user_ids;
  if (achievement.users?.length) return achievement.users.map((user) => user.id);
  return [];
}

export function useAchievementsView() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Achievement | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [assignmentAchievementId, setAssignmentAchievementId] = useState<number | null>(null);
  const [revokeUserId, setRevokeUserId] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data: achievements = [], isLoading, isError } = useAchievements();
  const assignmentQuery = useAchievementById(assignmentAchievementId ?? 0);
  const { data: userResponse } = useUserList(
    userSearch ? { search: userSearch, per_page: 10 } : { per_page: 10 },
  );

  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const deleteMutation = useDeleteAchievement();
  const assignMutation = useAssignAchievement();
  const revokeMutation = useRevokeAchievement();

  const createForm = useForm<StoreAchievementPayload>({
    resolver: zodResolver(storeAchievementSchema),
  });

  const editForm = useForm<StoreAchievementPayload>({
    resolver: zodResolver(storeAchievementSchema),
  });

  const assignmentAchievement =
    assignmentQuery.data ??
    achievements.find((achievement) => achievement.id === assignmentAchievementId) ??
    null;

  const assignedUserIds = getAssignedUserIds(assignmentAchievement);

  const assignedUserQueries = useQueries({
    queries: assignedUserIds.map((userId) => ({
      queryKey: ["users", "detail", userId],
      queryFn: () => userService.show(userId),
      enabled: !!userId,
    })),
  });

  const assignedUsersWithNames: AssignmentUserView[] = assignedUserIds.map((userId, index) => {
    const resolved = assignedUserQueries[index]?.data;
    return {
      id: userId,
      name: resolved?.name ?? null,
      email: resolved?.email ?? null,
    };
  });

  const availableUserOptions = (userResponse?.data ?? []).filter(
    (user) => !assignedUserIds.includes(user.id),
  );

  const openCreateForm = () => {
    createForm.reset();
    setCreateOpen(true);
  };

  const closeCreateForm = () => {
    createForm.reset();
    setCreateOpen(false);
  };

  const openEditForm = (achievement: Achievement) => {
    setEditItem(achievement);
    editForm.reset({
      achievement_name: achievement.name,
      description: achievement.description ?? undefined,
      criteria_type: achievement.criteria_type,
      criteria_value: achievement.criteria_value,
      icon: achievement.icon ?? undefined,
    });
  };

  const closeEditForm = () => {
    setEditItem(null);
    editForm.reset();
  };

  const openAssignments = (achievement: Achievement) => {
    setAssignmentAchievementId(achievement.id);
    setSelectedUserId(null);
    setUserSearch("");
  };

  const closeAssignments = () => {
    setAssignmentAchievementId(null);
    setSelectedUserId(null);
    setUserSearch("");
  };

  const requestDeleteAchievement = (achievement: Achievement) => {
    setDeleteId(achievement.id);
  };

  const requestRevokeAchievement = (userId: number) => {
    setRevokeUserId(userId);
  };

  const handleCreate = createForm.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Achievement created");
      closeCreateForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to create");
    }
  });

  const handleEdit = editForm.handleSubmit(async (data) => {
    if (!editItem) return;
    try {
      await updateMutation.mutateAsync({ id: editItem.id, ...data });
      toast.success("Achievement updated");
      closeEditForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to update");
    }
  });

  const confirmDeleteAchievement = async () => {
    if (deleteId === null) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Achievement deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const handleAssign = async () => {
    if (!assignmentAchievementId || !selectedUserId) return;
    try {
      await assignMutation.mutateAsync({
        achievementId: assignmentAchievementId,
        userId: selectedUserId,
      });
      toast.success("Achievement assigned successfully");
      setSelectedUserId(null);
      setUserSearch("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to assign achievement");
    }
  };

  const confirmRevokeAchievement = async () => {
    if (!assignmentAchievementId || revokeUserId === null) return;
    try {
      await revokeMutation.mutateAsync({
        achievementId: assignmentAchievementId,
        userId: revokeUserId,
      });
      toast.success("Achievement revoked successfully");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message ?? "Failed to revoke achievement");
    } finally {
      setRevokeUserId(null);
    }
  };

  return {
    achievements,
    isLoading,
    isError,
    createOpen,
    setCreateOpen,
    editItem,
    deleteId,
    setDeleteId,
    assignmentAchievementId,
    assignmentAchievement,
    assignedUsersWithNames,
    availableUserOptions,
    userSearch,
    setUserSearch,
    selectedUserId,
    setSelectedUserId,
    revokeUserId,
    setRevokeUserId,
    createForm,
    editForm,
    createMutation,
    updateMutation,
    deleteMutation,
    assignMutation,
    revokeMutation,
    openCreateForm,
    closeCreateForm,
    openEditForm,
    closeEditForm,
    openAssignments,
    closeAssignments,
    requestDeleteAchievement,
    requestRevokeAchievement,
    confirmDeleteAchievement,
    handleCreate,
    handleEdit,
    handleAssign,
    confirmRevokeAchievement,
  };
}