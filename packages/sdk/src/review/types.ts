export interface PrevuiwConfig {
  apiUrl: string;
  projectKey: string;
  versionId?: string;
}

export interface ResolvedVersion {
  versionId: string;
  projectId: string;
  versionName: string;
}

export interface CommentData {
  id: string;
  content: string;
  posX: number;
  posY: number;
  cssSelector: string | null;
  pageUrl: string | null;
  guestName: string | null;
  isResolved: boolean;
  author: { id: string; name: string; avatarUrl: string | null } | null;
  createdAt: string;
  replies?: CommentData[];
}

export interface CursorInfo {
  socketId: string;
  name: string;
  x: number;
  y: number;
}
