import type { ResolvedVersion, CommentData, Viewport } from "./types";

export class ApiClient {
  constructor(
    private apiUrl: string,
    private projectKey: string,
    private inviteToken: string,
    private jwtToken?: string,
  ) {}

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.jwtToken) {
      headers["Authorization"] = `Bearer ${this.jwtToken}`;
    }
    return headers;
  }

  async resolveVersion(versionKey: string): Promise<ResolvedVersion | null> {
    const res = await fetch(`${this.apiUrl}/sdk/resolve-version`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectKey: this.projectKey,
        versionKey,
        inviteToken: this.inviteToken,
      }),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async getComments(versionId: string, viewport: Viewport): Promise<CommentData[]> {
    const res = await fetch(
      `${this.apiUrl}/versions/${versionId}/comments?viewport=${viewport}`
    );
    if (!res.ok) return [];
    return res.json();
  }

  async createComment(
    versionId: string,
    data: {
      content: string;
      posX: number;
      posY: number;
      viewport: Viewport;
      cssSelector: string | null;
      pageUrl: string;
      reviewerName: string;
    }
  ): Promise<CommentData | null> {
    const res = await fetch(`${this.apiUrl}/versions/${versionId}/comments`, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async createReply(
    versionId: string,
    data: {
      content: string;
      parentId: string;
      reviewerName: string;
      viewport: Viewport;
    }
  ): Promise<CommentData | null> {
    const res = await fetch(`${this.apiUrl}/versions/${versionId}/comments`, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify({
        content: data.content,
        posX: 0,
        posY: 0,
        viewport: data.viewport,
        parentId: data.parentId,
        reviewerName: data.reviewerName,
      }),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async resolveComment(versionId: string, commentId: string): Promise<CommentData | null> {
    const res = await fetch(
      `${this.apiUrl}/versions/${versionId}/comments/${commentId}/resolve`,
      { method: "PATCH", headers: this.authHeaders() }
    );
    if (!res.ok) return null;
    return res.json();
  }

  async checkScreenshotExists(
    versionKey: string,
    viewport: Viewport,
    pageUrl: string,
  ): Promise<boolean> {
    // Simple check via the screenshot upload endpoint behavior
    // The server will skip if already exists, so we just return false to always attempt
    return false;
  }

  async uploadScreenshot(
    versionKey: string,
    viewport: Viewport,
    pageUrl: string,
    blob: Blob,
  ): Promise<boolean> {
    const formData = new FormData();
    formData.append("screenshot", blob, "screenshot.png");
    formData.append("versionKey", versionKey);
    formData.append("inviteToken", this.inviteToken);
    formData.append("viewport", viewport);
    formData.append("pageUrl", pageUrl);

    const res = await fetch(`${this.apiUrl}/sdk/screenshot`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.uploaded;
  }
}
