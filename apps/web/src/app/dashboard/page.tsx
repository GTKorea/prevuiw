"use client";
import { useProjects } from "@/entities/project";
import { ProjectCard } from "@/components/dashboard/project-card";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { useI18n } from "@/i18n/context";

export default function DashboardPage() {
  const { data: projects, isLoading } = useProjects();
  const { t } = useI18n();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("dashboard.title")}</h2>
        <CreateProjectDialog />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t("dashboard.loading")}</p>
      ) : projects?.length === 0 ? (
        <p className="text-muted-foreground">{t("dashboard.noProjects")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              name={project.name}
              slug={project.slug}
              versionCount={project._count.versions}
              sdkConnected={project.sdkConnected}
              latestVersion={project.versions[0]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
