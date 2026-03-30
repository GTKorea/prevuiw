"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3012";

interface IframeContainerProps {
  url: string;
  useProxy?: boolean;
  onProxyError?: () => void;
}

export function IframeContainer({ url, useProxy, onProxyError }: IframeContainerProps) {
  const src = useProxy
    ? `${API_URL}/proxy?url=${encodeURIComponent(url)}`
    : url;

  return (
    <iframe
      src={src}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      title="Preview"
      onError={onProxyError}
    />
  );
}
