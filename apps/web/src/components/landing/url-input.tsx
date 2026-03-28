"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export function UrlInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      // Create project with URL as name, then create version
      const project = await api.post<{ id: string; slug: string }>("/projects", {
        name: new URL(url).hostname,
      });
      await api.post(`/projects/${project.id}/versions`, {
        versionName: "v1.0",
        url: url.trim(),
      });
      router.push(`/p/${project.slug}`);
    } catch (error) {
      // If not authenticated, this will fail — redirect to sign in
      // For MVP, show an alert or redirect
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl items-center gap-2">
      <Input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://your-app.vercel.app"
        className="h-12 flex-1 bg-neutral-900 border-neutral-700 text-base"
        required
      />
      <Button
        type="submit"
        disabled={loading}
        className="h-12 px-6 text-base font-semibold"
        variant="default"
      >
        {loading ? "Creating..." : "Preview →"}
      </Button>
    </form>
  );
}
