// ─── Common Types ───

export type Viewport = "MOBILE_375" | "TABLET_768" | "LAPTOP_1440" | "DESKTOP_1920";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface Author {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Reaction {
  id: string;
  emoji: string;
  user: { id: string; name: string };
}

export interface Comment {
  id: string;
  versionId: string;
  authorId: string | null;
  reviewerName: string | null;
  content: string;
  posX: number;
  posY: number;
  viewport: Viewport;
  pageUrl: string | null;
  cssSelector: string | null;
  parentId: string | null;
  isResolved: boolean;
  createdAt: string;
  author: Author | null;
  replies: Comment[];
  reactions: Reaction[];
}

export interface Screenshot {
  id: string;
  viewport: Viewport;
  pageUrl: string;
  imageUrl: string;
}

export interface Version {
  id: string;
  versionName: string;
  domain: string;
  versionKey: string;
  inviteToken: string;
  memo: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { comments: number };
  screenshots: Screenshot[];
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  publishableKey: string | null;
  sdkConnected: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { versions: number };
  versions: Version[];
}

export interface ProjectDetail extends Omit<Project, 'versions'> {
  owner: Author;
  versions: Version[];
}

export interface Notification {
  id: string;
  type: "MENTION" | "REPLY" | "RESOLVE";
  isRead: boolean;
  createdAt: string;
  comment: {
    content: string;
    author: Author | null;
    reviewerName: string | null;
    version: {
      id: string;
      versionName: string;
      project: { name: string; slug: string };
    };
  };
}
