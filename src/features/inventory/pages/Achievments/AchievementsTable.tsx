import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PermissionGate } from "@/core/auth/PermissionGate";
import { Pencil, Trash2, UserPlus, Users } from "lucide-react";

import type { Achievement } from "@/shared/types/index";

function getAssignedCount(achievement: Achievement): number {
  return achievement.assigned_user_ids?.length ?? achievement.users?.length ?? 0;
}

type AchievementsTableProps = {
  achievements: Achievement[];
  onManageAssignments: (achievement: Achievement) => void;
  onEdit: (achievement: Achievement) => void;
  onDelete: (achievement: Achievement) => void;
};

export const AchievementsTable = ({
  achievements,
  onManageAssignments,
  onEdit,
  onDelete,
}: AchievementsTableProps) => (
  <div className="rounded-lg border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Criteria Type</TableHead>
          <TableHead>Criteria Value</TableHead>
          <TableHead>Assigned Users</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {achievements.map((achievement) => (
          <TableRow key={achievement.id}>
            <TableCell className="font-medium">
              {achievement.icon ? `${achievement.icon} ` : ""}
              {achievement.name}
            </TableCell>
            <TableCell className="max-w-xs truncate text-muted-foreground">
              {achievement.description ?? "—"}
            </TableCell>
            <TableCell>{achievement.criteria_type}</TableCell>
            <TableCell>{achievement.criteria_value}</TableCell>
            <TableCell>
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {getAssignedCount(achievement)} assigned
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onManageAssignments(achievement)}
                  aria-label={`Manage assignments for ${achievement.name}`}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
                <PermissionGate permission="achievements.edit">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(achievement)}
                    aria-label={`Edit ${achievement.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </PermissionGate>
                <PermissionGate permission="achievements.delete">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => onDelete(achievement)}
                    aria-label={`Delete ${achievement.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </PermissionGate>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);