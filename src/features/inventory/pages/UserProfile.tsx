/* ═══════════════════════════════════════════════════════════════════════════
 * UserProfile — User profile page with achievements.
 * ═══════════════════════════════════════════════════════════════════════════ */

import {
    Award,
    ExternalLink,
    FileText,
    Mail,
    Pencil,
    Phone,
    Plus,
    Shield,
    Trash2,
    User,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/core/auth/AuthContext";
import AppLayout from "@/core/layouts/AppLayout";
import PageHeader from "@/shared/components/PageHeader";
import { toast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";

import type { ResearchAchievement } from "@/features/inventory/types";

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  "Lab Manager":
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "Lab Assistant":
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const UserProfile = () => {
  const { user: authUser } = useAuthContext();

  // Map auth context user to profile shape
  const user = {
    id: String(authUser?.id ?? ""),
    name: authUser?.name ?? "Unknown",
    email: authUser?.email ?? "",
    role: authUser?.role ?? "Lab Assistant",
    phone: authUser?.phone ?? null,
    profileImageUrl: undefined as string | undefined,
  };

  // TODO: Replace with backend API when research achievements endpoint exists
  const [achievements, setAchievements] = useState<ResearchAchievement[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    documentLink: "",
    achievementDate: "",
    status: "Draft" as "Draft" | "Published",
  });

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      documentLink: "",
      achievementDate: "",
      status: "Draft",
    });
    setDialogOpen(true);
  };

  const openEditForm = (ach: ResearchAchievement) => {
    setEditingId(ach.id);
    setForm({
      title: ach.title,
      description: ach.description ?? "",
      documentLink: ach.documentLink ?? "",
      achievementDate: ach.achievementDate,
      status: ach.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.achievementDate) {
      toast({
        title: "Error",
        description: "Title and date are required",
        variant: "destructive",
      });
      return;
    }
    if (editingId) {
      setAchievements((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...form } : a)),
      );
      toast({
        title: "Updated",
        description: "Achievement updated successfully",
      });
    } else {
      const newId = `ACH-${String(achievements.length + 10).padStart(3, "0")}`;
      setAchievements((prev) => [
        ...prev,
        {
          id: newId,
          achievementCode: newId,
          userId: user.id,
          userName: user.name,
          title: form.title,
          description: form.description,
          documentLink: form.documentLink || undefined,
          achievementDate: form.achievementDate,
          status: form.status,
          createdAt: new Date().toISOString(),
        },
      ]);
      toast({ title: "Created", description: "New achievement added" });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Deleted", description: "Achievement removed" });
  };

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          icon={User}
          title="My Profile"
          description="Your profile information and research achievements"
        />

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Award className="h-4 w-4" />
              Achievements ({achievements.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Profile Tab ── */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {user.name}
                      </h2>
                      <Badge className={cn("mt-1", ROLE_COLORS[user.role])}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Achievements Tab ── */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Research Achievements</h3>
                <p className="text-sm text-muted-foreground">
                  Your research publications, findings, and milestones
                </p>
              </div>
              <Button className="gap-2" onClick={openCreateForm}>
                <Plus className="h-4 w-4" />
                Add Achievement
              </Button>
            </div>

            {achievements.length === 0 ? (
              <Card className="p-8 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium">No achievements yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start adding your research accomplishments.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {achievements.map((ach) => (
                  <Card key={ach.id} className="group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-2 mt-0.5">
                            <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-sm font-semibold">
                              {ach.title}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {ach.achievementDate} • {ach.achievementCode}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={
                              ach.status === "Published"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {ach.status}
                          </Badge>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEditForm(ach)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDelete(ach.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    {(ach.description || ach.documentLink) && (
                      <CardContent className="pt-0 space-y-2">
                        {ach.description && (
                          <p className="text-sm text-muted-foreground">
                            {ach.description}
                          </p>
                        )}
                        {ach.documentLink && (
                          <a
                            href={ach.documentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View Document
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Achievement Create/Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Achievement" : "Add Achievement"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update your achievement details."
                : "Record a new research achievement."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Achievement title"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.achievementDate}
                onChange={(e) =>
                  setForm({ ...form, achievementDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                placeholder="Describe the achievement..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Document Link</Label>
              <Input
                value={form.documentLink}
                onChange={(e) =>
                  setForm({ ...form, documentLink: e.target.value })
                }
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as "Draft" | "Published" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default UserProfile;
