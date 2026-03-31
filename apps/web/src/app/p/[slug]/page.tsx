"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useProject } from "@/hooks/use-versions";
import { VersionList } from "@/components/version/version-list";
import { CreateVersionDialog } from "@/components/version/create-version-dialog";
import { useAuth } from "@/hooks/use-auth";

export default function VersionHistoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: project, isLoading } = useProject(slug);
  const { user } = useAuth();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!project) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Project not found</p></div>;

  const isOwner = user?.id === project.owner?.id;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">←</Link>
          <h1 className="text-xl font-semibold">{project.name}</h1>
          <span className="text-muted-foreground text-sm">— Version History</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{project.versions.length} version{project.versions.length !== 1 ? "s" : ""}</p>
          {isOwner && <CreateVersionDialog projectId={project.id} />}
        </div>

        {project.versions.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No versions yet. Add your first version to get started!</p>
        ) : (
          <VersionList versions={project.versions} projectSlug={slug} />
        )}
      </div>
    </div>
  );
}
