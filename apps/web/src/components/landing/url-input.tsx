"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export function UrlInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    try {
      let hostname: string;
      try {
        hostname = new URL(url).hostname;
      } catch {
        hostname = url.trim();
      }

      const project = await api.post<{ id: string; slug: string; firstVersionId?: string }>(
        "/projects",
        { name: hostname, url: url.trim() },
      );

      if (project.firstVersionId) {
        router.push(`/p/${project.slug}/${project.firstVersionId}`);
      } else {
        router.push(`/p/${project.slug}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("403")) {
        setError("하루 2개 프로젝트 제한에 도달했습니다. 더 많은 프로젝트를 만들려면 로그인하세요.");
      } else {
        setError("프로젝트 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
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
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
