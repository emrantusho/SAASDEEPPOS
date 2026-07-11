export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
}

export interface SyncResult {
  success: boolean;
  fileId?: string;
  error?: string;
}
