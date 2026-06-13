/* ═══════════════════════════════════════════════════════════════════════════
 * UserProfile — User profile page with achievements and contributions.
 * ═══════════════════════════════════════════════════════════════════════════ */

import {
  Award,
  Leaf,
  Loader2,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/core/auth/AuthContext";
import AppLayout from "@/core/layouts/AppLayout";
import PageHeader from "@/shared/components/PageHeader";
import { ServerPagination } from "@/shared/components/ServerPagination";

import { useAchievements } from "@/features/inventory/services/achievementService";
import { usePlantSampleList } from "@/features/inventory/services/plantSampleService";

const UserProfile = () => {
  const { user: authUser } = useAuthContext();

  const [samplesPage, setSamplesPage] = useState(1);

  // Fetch real achievements assigned to the current user
  const { data: achievements, isLoading: isAchievementsLoading } = useAchievements({ user_id: "me", per_page: 100 });

  // Fetch plant samples contributed by the current user
  const { data: sampleResponse, isLoading: isSamplesLoading } = usePlantSampleList({
    user_id: "me",
    page: samplesPage,
    per_page: 8, // Using a multiple of 4 is better for 1/2/4 grid layouts, but 8 is fine for 1/2/3 grids on most pages
  });

  const contributions = sampleResponse?.data ?? [];
  const sampleMeta = sampleResponse?.meta;

  // Map auth context user to profile shape
  const user = {
    id: String(authUser?.id ?? ""),
    name: authUser?.name ?? "Unknown",
    email: authUser?.email ?? "",
    role: authUser?.role ?? "Lab Assistant",
    phone: authUser?.phone ?? null,
    profileImageUrl: undefined as string | undefined,
  };

  return (
    <AppLayout>
      <div className="page-content">
        <PageHeader
          title="My Profile"
          description="Your profile information, achievements, and lab contributions"
        />

        <div className="max-w-5xl mx-auto space-y-6">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2">
                <Award className="h-4 w-4" />
                Achievements ({achievements?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="contributions" className="gap-2">
                <Leaf className="h-4 w-4" />
                Contributions ({sampleMeta?.total ?? 0})
              </TabsTrigger>
            </TabsList>

            {/* ─── Profile Tab ─── */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardContent className="pt-8 pb-8">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-primary/20">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-primary/70" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 w-full flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6">
                      <div className="text-center sm:text-left">
                        <h2 className="text-3xl font-bold truncate tracking-tight">
                          {user.name}
                        </h2>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                          <Badge variant="secondary" className="gap-1.5 rounded-md px-2.5 py-0.5">
                            <Shield className="h-3.5 w-3.5 opacity-70" />
                            {user.role}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-6 text-sm mt-5 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 opacity-70" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 opacity-70" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 shrink-0 mt-4 sm:mt-0">
                        <div className="text-center bg-muted/40 border rounded-xl p-4 min-w-[110px]">
                          <p className="text-3xl font-bold text-primary">{achievements?.length ?? 0}</p>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">Achievements</p>
                        </div>
                        <div className="text-center bg-muted/40 border rounded-xl p-4 min-w-[110px]">
                          <p className="text-3xl font-bold text-primary">{sampleMeta?.total ?? 0}</p>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">Contributions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Achievements Tab ─── */}
            <TabsContent value="achievements" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Research Achievements</h3>
                  <p className="text-sm text-muted-foreground">
                    Your research publications, findings, and milestones
                  </p>
                </div>
              </div>

              {isAchievementsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                </div>
              ) : !achievements || achievements.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg">No achievements yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    Achievements assigned to you by lab managers will appear here.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {achievements.map((ach) => (
                    <Card key={ach.id} className="group flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-4 flex-1">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2.5 shrink-0">
                            <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="min-w-0 mt-0.5">
                            <CardTitle className="text-base font-bold leading-tight">
                              {ach.achievement_name}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1.5 text-muted-foreground/80 font-medium">
                              {ach.criteria?.type} • Required Value: {ach.criteria?.value}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      {ach.description && (
                        <CardContent className="pt-0">
                          <div className="bg-muted/40 rounded-lg p-3.5 border border-border/50">
                            <p className="text-[13px] italic text-muted-foreground leading-relaxed">
                              "{ach.description}"
                            </p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── Contributions Tab ─── */}
            <TabsContent value="contributions" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Lab Contributions</h3>
                  <p className="text-sm text-muted-foreground">
                    Plant samples you have contributed to the lab
                  </p>
                </div>
              </div>

              {isSamplesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                </div>
              ) : contributions.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <Leaf className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg">No contributions yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    Plant samples you record in the inventory will appear here.
                  </p>
                </Card>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {contributions.map((sample) => {
                      const isActive = sample.identity.status.toLowerCase() === "active";
                      const statusVariant = isActive
                        ? "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";

                      return (
                        <Card key={sample.id} className="group shadow-sm hover:border-primary/40 transition-colors">
                          <CardHeader className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="bg-green-100/80 dark:bg-green-900/30 rounded-md p-2 shrink-0">
                                  <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="min-w-0 mt-0.5">
                                  <CardTitle className="text-sm font-bold truncate">
                                    {sample.identity.code}
                                  </CardTitle>
                                  <CardDescription className="text-xs mt-1 truncate">
                                    {sample.relationships.variety?.name ?? "Unknown Variety"}
                                  </CardDescription>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                              {sample.lab_info.brought_at ? (
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  {new Date(sample.lab_info.brought_at).toLocaleDateString(undefined, {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                  })}
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium text-muted-foreground opacity-0">-</span>
                              )}
                              <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0 shadow-none capitalize ${statusVariant}`}>
                                {sample.identity.status}
                              </Badge>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>

                  <ServerPagination meta={sampleMeta} onPageChange={setSamplesPage} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserProfile;
