/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ActivityLog — Frontend page for viewing the Spatie activity log.
 *
 * MF-01: Audit trail viewer connected to /api/v1/activity-logs.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ClipboardList, Eye } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { api } from "@/core/api/api";
import AppLayout from "@/core/layouts/AppLayout";
import EmptyState from "@/shared/components/EmptyState";
import PageHeader from "@/shared/components/PageHeader";
import SearchFilter from "@/shared/components/SearchFilter";
import { useQuery } from "@tanstack/react-query";

// ─── Types ─────────────────────────────────────────────────────────────────

interface ActivityLogEntry {
  id: number;
  log_name: string;
  description: string;
  event: string;
  subject_type: string | null;
  subject_id: number | null;
  causer: { id: number; name: string; email: string } | null;
  properties: Record<string, unknown>;
  created_at: string;
}

interface ActivityLogResponse {
  status: string;
  data: ActivityLogEntry[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const EVENT_COLORS: Record<string, string> = {
  created: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  updated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  deleted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function formatSubjectType(type: string | null): string {
  if (!type) return "—";
  // Convert morph alias like "plant_species" to "Plant Species"
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ─── Component ─────────────────────────────────────────────────────────────

const ActivityLog = () => {
  const [page, setPage] = useState(1);
  const [eventFilter, setEventFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<ActivityLogEntry | null>(null);

  const params: Record<string, unknown> = { page, per_page: 20 };
  if (eventFilter !== "all") params.event = eventFilter;

  const { data, isLoading, isError } = useQuery<ActivityLogResponse>({
    queryKey: ["activity-logs", params],
    queryFn: () => api.get("/activity-logs", { params }).then((r) => r.data),
  });

  const entries = data?.data ?? [];
  const meta = data?.meta;

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          icon={ClipboardList}
          title="Activity Log"
          description="Complete audit trail of all system changes"
        />

        <SearchFilter
          query=""
          onQueryChange={() => {}}
          placeholder="Search activity logs..."
        >
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </SearchFilter>

        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-12">
            Loading activity logs…
          </p>
        )}

        {isError && (
          <p className="text-sm text-destructive text-center py-12">
            Failed to load activity logs.
          </p>
        )}

        {!isLoading && !isError && entries.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="No activity logs found"
            description="Activity will appear here as changes are made."
          />
        )}

        {entries.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Date</TableHead>
                  <TableHead className="w-[100px]">Event</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {formatDate(entry.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={EVENT_COLORS[entry.event] ?? ""}
                      >
                        {entry.event}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatSubjectType(entry.subject_type)}
                      {entry.subject_id && (
                        <span className="text-muted-foreground ml-1">
                          #{entry.subject_id}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate">
                      {entry.description}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.causer?.name ?? "System"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setSelectedLog(entry)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Page {meta.current_page} of {meta.last_page} ({meta.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog
          open={!!selectedLog}
          onOpenChange={(open) => !open && setSelectedLog(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Activity Detail</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground">Event</p>
                    <Badge
                      variant="secondary"
                      className={EVENT_COLORS[selectedLog.event] ?? ""}
                    >
                      {selectedLog.event}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p>{formatDate(selectedLog.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Entity</p>
                    <p>
                      {formatSubjectType(selectedLog.subject_type)} #
                      {selectedLog.subject_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">User</p>
                    <p>{selectedLog.causer?.name ?? "System"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Description</p>
                  <p>{selectedLog.description}</p>
                </div>
                {Object.keys(selectedLog.properties ?? {}).length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-1">
                      Changed Properties
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-64">
                      {JSON.stringify(selectedLog.properties, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ActivityLog;
