"use client";

import { useState } from "react";
import type { Comment } from "@/shared/types";
import { cn } from "@/shared/lib";

interface Screenshot {
  id: string;
  viewport: string;
  pageUrl: string;
  imageUrl: string;
}

interface ScreenshotViewerProps {
  screenshots: Screenshot[];
  comments: Comment[];
}

export function ScreenshotViewer({ screenshots, comments }: ScreenshotViewerProps) {
  const [activePage, setActivePage] = useState(screenshots[0]?.pageUrl || "");

  // Get unique pages
  const pages = [...new Set(screenshots.map((s) => s.pageUrl))];
  const activeScreenshot = screenshots.find((s) => s.pageUrl === activePage);

  // Comments for the active page
  const pageComments = comments.filter((c) => c.pageUrl === activePage);

  if (screenshots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No screenshots available
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page tabs */}
      {pages.length > 1 && (
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-background/50 overflow-x-auto">
          {pages.map((pageUrl) => {
            const displayUrl = (() => {
              try { return new URL(pageUrl).pathname; } catch { return pageUrl; }
            })();
            return (
              <button
                key={pageUrl}
                onClick={() => setActivePage(pageUrl)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap",
                  activePage === pageUrl
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {displayUrl}
              </button>
            );
          })}
        </div>
      )}

      {/* Screenshot with comment pins */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4">
        {activeScreenshot && (
          <div className="relative inline-block">
            <img
              src={activeScreenshot.imageUrl}
              alt={`Screenshot of ${activePage}`}
              className="max-w-full h-auto shadow-lg rounded-lg"
            />
            {/* Overlay comment pins on the screenshot */}
            {pageComments.map((comment, index) => (
              <div
                key={comment.id}
                className="absolute"
                style={{
                  left: `${comment.posX}%`,
                  top: `${comment.posY}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full text-white text-xs font-bold shadow-lg w-6 h-6",
                    comment.isResolved ? "bg-green-500" : "bg-blue-500"
                  )}
                  title={`${comment.author?.name || comment.reviewerName || "Anonymous"}: ${comment.content}`}
                >
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
