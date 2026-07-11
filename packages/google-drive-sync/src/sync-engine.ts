import type { SyncResult } from "./types";
import { GoogleDriveClient } from "./drive-client";
import { MUTATIONS_FOLDER, PRODUCTS_FILE, APP_DATA_FOLDER } from "@saasdeep/shared";

export type PgliteDumpFunction = () => Promise<Uint8Array>;
export type PgliteLoadFunction = (data: Uint8Array) => Promise<void>;

export class SyncEngine {
  private driveClient: GoogleDriveClient;
  private lastSyncAt: number = 0;
  private appDataFolderId: string | null = null;
  private mutationsFolderId: string | null = null;

  constructor(accessToken: string) {
    this.driveClient = new GoogleDriveClient(accessToken);
  }

  async initialize(): Promise<void> {
    this.appDataFolderId = await this.driveClient.findOrCreateFolder(APP_DATA_FOLDER);
    this.mutationsFolderId = await this.driveClient.findOrCreateFolder(MUTATIONS_FOLDER, this.appDataFolderId);
  }

  async pushJsonFile(filename: string, data: unknown): Promise<SyncResult> {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const parentId = this.appDataFolderId ?? undefined;
    const fileId = await this.driveClient.createOrUpdateFile(filename, blob, parentId);
    return { success: true, fileId };
  }

  async readJsonFile<T>(filename: string): Promise<T | null> {
    try {
      const files = await this.driveClient.listFiles(this.appDataFolderId ?? undefined);
      const file = files.find(f => f.name === filename);
      if (!file) return null;
      const content = await this.driveClient.readFileAsString(file.id);
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }

  async uploadProductImage(file: Blob, filename: string): Promise<{ fileId: string; url: string }> {
    const imagesFolderId = await this.driveClient.findOrCreateFolder("product-images", this.appDataFolderId ?? undefined);
    const fileId = await this.driveClient.uploadImage(file, filename, imagesFolderId);
    const url = `https://drive.google.com/uc?export=view&id=${fileId}`;
    return { fileId, url };
  }

  get driveClientInstance(): GoogleDriveClient {
    return this.driveClient;
  }
}
