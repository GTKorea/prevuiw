"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3012";

interface IframeContainerProps {
  url: string;
}

export function IframeContainer({ url }: IframeContainerProps) {
  const src = `${API_URL}/proxy?url=${encodeURIComponent(url)}`;

  return (
    <iframe
      src={src}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      title="Preview"
    />
  );
}
