import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import AppLayout from "@/core/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAchievementById } from "@/features/inventory/services/achievementService";
import { downloadDocument } from "@/features/inventory/services/userDocumentService";
import type { UserDocument } from "@/shared/types/index";

export default function AchievementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: achievement, isLoading } = useAchievementById(Number(id));

  const handleDownload = async (doc: UserDocument) => {
    try {
      await downloadDocument(doc.id, doc.title);
    } catch (error) {
      console.error("Failed to download document:", error);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-muted-foreground">Loading achievement...</div>
      </AppLayout>
    );
  }

  if (!achievement) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-muted-foreground">
          <p>Achievement not found.</p>
          <Button variant="link" onClick={() => navigate("/inventory/achievements")}>
            Back to Achievements
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/inventory/achievements")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Achievement Details</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievement.image ? (
                <div className="aspect-square overflow-hidden rounded-md border">
                  <img src={achievement.image} alt={achievement.achievement_name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-md border bg-muted">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
              <div>
                <h3 className="font-semibold">{achievement.achievement_name}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description || "No description provided."}</p>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Criteria:</div>
                <Badge variant="secondary">
                  {achievement.criteria?.type}: {achievement.criteria?.value}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Linked Documents</CardTitle>
              <CardDescription>Documents uploaded and linked to this achievement.</CardDescription>
            </CardHeader>
            <CardContent>
              {achievement.user_documents && achievement.user_documents.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left">
                        <th className="p-3 font-medium">Title</th>
                        <th className="p-3 font-medium">Type</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {achievement.user_documents.map((doc) => (
                        <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3 font-medium">{doc.title}</td>
                          <td className="p-3 uppercase text-muted-foreground">{doc.file_type}</td>
                          <td className="p-3 capitalize">{doc.status || "active"}</td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(doc)}
                              disabled={!doc.download_url}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground border rounded-md">
                  No documents linked to this achievement.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
