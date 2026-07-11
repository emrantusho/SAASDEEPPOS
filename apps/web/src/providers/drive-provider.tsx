"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useDrive } from "@/hooks/use-drive";
import type { SyncState } from "@saasdeep/shared";
import type { SyncEngine } from "@saasdeep/google-drive-sync";

interface DriveContextValue {
  syncState: SyncState;
  isAuthenticated: boolean;
  connect: (tokens: { accessToken: string; refreshToken: string; expiryDate: number }) => Promise<void>;
  disconnect: () => void;
  pushJsonFile: (filename: string, data: unknown) => Promise<{ success: boolean; fileId?: string; error?: string }>;
  getAuthUrl: () => string;
  engine: SyncEngine | null;
}

const DriveContext = createContext<DriveContextValue | null>(null);

export function DriveProvider({ children }: { children: ReactNode }) {
  const drive = useDrive();
  return <DriveContext.Provider value={drive}>{children}</DriveContext.Provider>;
}

export function useDriveContext(): DriveContextValue {
  const ctx = useContext(DriveContext);
  if (!ctx) throw new Error("useDriveContext must be used within DriveProvider");
  return ctx;
}
