import type { ResolvedVersion, CommentData } from "./types";

export class ApiClient {
  constructor(private apiUrl: string, private projectKey: string) {}

  async resolveVersion(currentUrl: string): Promise<ResolvedVersion | null> {
    const res = await fetch(`${this.apiUrl}/sdk/resolve-version`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectKey: this.projectKey, currentUrl }),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async getComments(versionId: string): Promise<CommentData[]> {
    const res = await fetch(`${this.apiUrl}/versions/${versionId}/comments`);
    if (!res.ok) return [];
    return res.json();
  }

  async createReply(
    versionId: string,
    data: {
      content: string;
      parentId: string;
      guestName: string;
    }
  ): Promise<CommentData | null> {
    const res = await fetch(`${this.apiUrl}/versions/${versionId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: data.content,
        posX: 0,
        posY: 0,
        parentId: data.parentId,
        guestName: data.guestName,
      }),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async createComment(
    versionId: string,
    data: {
      content: string;
      posX: number;
      posY: number;
      cssSelector: string | null;
      pageUrl: string;
      guestName: string;
    }
  ): Promise<CommentData | null> {
    const res = await fetch(`${this.apiUrl}/versions/${versionId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  }
}
