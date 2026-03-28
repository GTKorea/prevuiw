"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Monitor, Smartphone, Tablet } from "lucide-react";

interface Screenshot {
  id: string;
  viewport: string;
  imageUrl: string;
}

interface ScreenshotViewerProps {
  screenshots: Screenshot[];
}

const VIEWPORT_ICONS: Record<string, React.ReactNode> = {
  desktop: <Monitor className="size-4" />,
  tablet: <Tablet className="size-4" />,
  mobile: <Smartphone className="size-4" />,
};

export function ScreenshotViewer({ screenshots }: ScreenshotViewerProps) {
  const [activeViewport, setActiveViewport] = useState(
    screenshots[0]?.viewport || "desktop"
  );

  const activeScreenshot = screenshots.find(
    (s) => s.viewport === activeViewport
  );

  if (screenshots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No screenshots available
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Viewport switcher */}
      {screenshots.length > 1 && (
        <div className="flex items-center justify-center gap-1 p-2 border-b border-border bg-background/50">
          {screenshots.map((s) => (
            <Button
              key={s.viewport}
              variant={activeViewport === s.viewport ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setActiveViewport(s.viewport)}
              className={cn(
                "gap-1.5",
                activeViewport === s.viewport && "font-medium"
              )}
            >
              {VIEWPORT_ICONS[s.viewport] || <Monitor className="size-4" />}
              {s.viewport}
            </Button>
          ))}
        </div>
      )}

      {/* Screenshot */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4">
        {activeScreenshot && (
          <img
            src={activeScreenshot.imageUrl}
            alt={`${activeScreenshot.viewport} screenshot`}
            className="max-w-full h-auto shadow-lg rounded-lg"
          />
        )}
      </div>
    </div>
  );
}
