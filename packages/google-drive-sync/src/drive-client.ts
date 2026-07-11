import type { DriveFile } from "./types";

export class GoogleDriveClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request(url: string, options: RequestInit = {}): Promise<Response> {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return res;
  }

  async findOrCreateFolder(name: string, parentId?: string): Promise<string> {
    const query = `name='${name}' and mimeType='application/vnd.google-apps.folder'${parentId ? ` and '${parentId}' in parents` : ""}`;
    const res = await this.request(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`
    );
    const data = await res.json();
    if (data.files?.length > 0) return data.files[0].id;

    const createRes = await this.request("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentId ? [parentId] : [],
      }),
    });
    const created = await createRes.json();
    return created.id;
  }

  async createOrUpdateFile(name: string, content: Blob, parentId?: string): Promise<string> {
    const existing = await this.findFile(name, parentId);
    if (existing) {
      await this.updateFile(existing.id, content);
      return existing.id;
    }
    return this.createFile(name, content, parentId);
  }

  private async findFile(name: string, parentId?: string): Promise<DriveFile | null> {
    let query = `name='${name}' and trashed=false`;
    if (parentId) query += ` and '${parentId}' in parents`;
    const res = await this.request(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,createdTime,modifiedTime)`
    );
    const data = await res.json();
    return data.files?.[0] ?? null;
  }

  private async createFile(name: string, content: Blob, parentId?: string): Promise<string> {
    const metadata = { name, parents: parentId ? [parentId] : [] };
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", content, name);
    const res = await this.request("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    return data.id;
  }

  private async updateFile(fileId: string, content: Blob): Promise<void> {
    await this.request(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      { method: "PATCH", body: content }
    );
  }

  async readFileAsString(fileId: string): Promise<string> {
    const res = await this.request(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
    return res.text();
  }

  async readFileAsBlob(fileId: string): Promise<Blob> {
    const res = await this.request(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
    return res.blob();
  }

  async listFiles(folderId?: string): Promise<DriveFile[]> {
    let query = "trashed=false";
    if (folderId) query += ` and '${folderId}' in parents`;
    const res = await this.request(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,createdTime,modifiedTime,size)`
    );
    const data = await res.json();
    return data.files ?? [];
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.request(`https://www.googleapis.com/drive/v3/files/${fileId}`, { method: "DELETE" });
  }

  async uploadImage(file: Blob, filename: string, parentId?: string): Promise<string> {
    return this.createFile(filename, file, parentId);
  }

  async getFileWebViewLink(fileId: string): Promise<string> {
    const res = await this.request(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink`
    );
    const data = await res.json();
    return data.webViewLink ?? `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
}
