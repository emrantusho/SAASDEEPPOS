export interface SyncState {
  status: "idle" | "syncing" | "success" | "error";
  lastSyncAt: number | null;
  lastMutationId: string | null;
  error: string | null;
}

export interface Mutation {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  source: string;
}
