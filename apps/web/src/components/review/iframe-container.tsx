"use client";

interface IframeContainerProps {
  url: string;
}

export function IframeContainer({ url }: IframeContainerProps) {
  return (
    <iframe
      src={url}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      title="Preview"
    />
  );
}
