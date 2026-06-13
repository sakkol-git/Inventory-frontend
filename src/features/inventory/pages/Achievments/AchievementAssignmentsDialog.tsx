import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, UserX, Users } from "lucide-react";

type AssignedUserView = {
  id: number;
  name: string | null;
  email: string | null;
};

type AchievementAssignmentsDialogProps = {
  open: boolean;
  achievement: { achievement_name: string } | null;
  availableUsers: Array<{ id: number; name: string; email: string }>;
  assignedUsers: AssignedUserView[];
  selectedUserId: number | null;
  onSelectedUserChange: (id: number | null) => void;
  userSearch: string;
  onUserSearchChange: (value: string) => void;
  onAssign: () => void;
  onRequestRevoke: (userId: number) => void;
  onOpenChange: (open: boolean) => void;
  isAssignPending: boolean;
};

export const AchievementAssignmentsDialog = ({
  open,
  achievement,
  availableUsers,
  assignedUsers,
  selectedUserId,
  onSelectedUserChange,
  userSearch,
  onUserSearchChange,
  onAssign,
  onRequestRevoke,
  onOpenChange,
  isAssignPending,
}: AchievementAssignmentsDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          Manage Assignments{achievement ? ` — ${achievement.achievement_name}` : ""}
        </DialogTitle>
        <DialogDescription>
          Assign this achievement to a user or revoke it from an existing assignee.
        </DialogDescription>
      </DialogHeader>

      {achievement ? (
        <div className="space-y-6 mt-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Assigned users</p>
              <p className="text-xs text-muted-foreground">
                {assignedUsers.length} user{assignedUsers.length === 1 ? "" : "s"} attached to this achievement.
              </p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {assignedUsers.length}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievement-user-search">Assign user</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="achievement-user-search"
                value={userSearch}
                onChange={(event) => onUserSearchChange(event.target.value)}
                placeholder="Search users by name or email"
                className="pl-9"
              />
            </div>
            <div className="max-h-48 overflow-y-auto rounded-md border">
              {availableUsers.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground">
                  No users match this search.
                </div>
              ) : (
                availableUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${selectedUserId === user.id ? "bg-muted" : ""}`}
                    onClick={() => onSelectedUserChange(user.id)}
                  >
                    <span>
                      <span className="font-medium">{user.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{user.email}</span>
                    </span>
                    {selectedUserId === user.id ? (
                      <Badge variant="secondary">Selected</Badge>
                    ) : null}
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={onAssign} disabled={isAssignPending || selectedUserId === null}>
                {isAssignPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning…
                  </>
                ) : (
                  "Assign Selected User"
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Current assignments</h4>
            {assignedUsers.length === 0 ? (
              <div className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
                No users assigned yet.
              </div>
            ) : (
              <div className="space-y-2">
                {assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{user.name ?? `User #${user.id}`}</p>
                      <p className="text-xs text-muted-foreground">{user.email ?? `ID ${user.id}`}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onRequestRevoke(user.id)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </DialogContent>
  </Dialog>
);