"use client";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "@/components/dashboard/project-card";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";

export default function DashboardPage() {
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">My Projects</h2>
        <CreateProjectDialog />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : projects?.length === 0 ? (
        <p className="text-muted-foreground">No projects yet. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              name={project.name}
              slug={project.slug}
              versionCount={project._count.versions}
              latestVersion={project.versions[0]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
