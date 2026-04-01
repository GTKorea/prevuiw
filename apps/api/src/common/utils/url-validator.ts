import { BadRequestException } from '@nestjs/common';

const BLOCKED_HOSTS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^\[::1\]$/,
];

export function validateExternalUrl(urlString: string): string {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new BadRequestException('Invalid URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new BadRequestException('Only HTTP/HTTPS URLs are allowed');
  }

  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev && BLOCKED_HOSTS.some(p => p.test(parsed.hostname))) {
    throw new BadRequestException('Internal/private URLs are not allowed');
  }

  return urlString;
}
