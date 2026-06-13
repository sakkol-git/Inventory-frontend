/* ═══════════════════════════════════════════════════════════════════════════
 * UserProfile — User profile page with achievements and contributions.
 * ═══════════════════════════════════════════════════════════════════════════ */

import {
  Award,
  Leaf,
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
import { Separator } from "@/components/ui/separator";
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
  const { data: achievements } = useAchievements({ user_id: "me", per_page: 100 });
  
  // Fetch plant samples contributed by the current user
  const { data: sampleData, meta: sampleMeta } = usePlantSampleList({
    user_id: "me",
    page: samplesPage,
    per_page: 8,
  });

  const contributions = sampleData ?? [];

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
          icon={User}
          title="My Profile"
          description="Your profile information, achievements, and lab contributions"
        />

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
                      <User className="h-10 w-10 text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold truncate">
                          {user.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="secondary" className="gap-1 rounded-md">
                            <Shield className="h-3 w-3" />
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{user.phone}</span>
                          </div>
                        )}
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

            {!achievements || achievements.length === 0 ? (
              <Card className="p-8 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium">No achievements yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Achievements assigned to you will appear here.
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
                              {ach.achievement_name}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {ach.criteria?.type} • Required Value: {ach.criteria?.value}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    {ach.description && (
                      <CardContent className="pt-0 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {ach.description}
                        </p>
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

            {contributions.length === 0 ? (
              <Card className="p-8 text-center">
                <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium">No contributions yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Plant samples you create will appear here.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {contributions.map((sample) => (
                  <Card key={sample.id} className="group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2 mt-0.5">
                            <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-sm font-semibold">
                              {sample.sample_code}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              Variety: {sample.plant_variety?.name ?? "Unknown"} • Status: {sample.status}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(sample.received_date).toLocaleDateString()}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}

                <ServerPagination meta={sampleMeta} onPageChange={setSamplesPage} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default UserProfile;
