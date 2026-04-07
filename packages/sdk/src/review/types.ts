export type Viewport = "MOBILE_375" | "TABLET_768" | "LAPTOP_1440" | "DESKTOP_1920";

export interface PrevuiwConfig {
  apiUrl: string;
  projectKey: string;
  versionKey: string;
  inviteToken: string;
}

export interface ResolvedVersion {
  versionId: string;
  projectId: string;
  versionName: string;
  domain: string;
}

export interface CommentData {
  id: string;
  content: string;
  posX: number;
  posY: number;
  viewport: Viewport;
  cssSelector: string | null;
  pageUrl: string | null;
  reviewerName: string | null;
  parentId: string | null;
  isResolved: boolean;
  author: { id: string; name: string; avatarUrl: string | null } | null;
  createdAt: string;
  replies?: CommentData[];
  reactions?: { emoji: string; userId: string }[];
}

export interface CursorInfo {
  socketId: string;
  name: string;
  x: number;
  y: number;
}
