"use client";

import { useState, useCallback, useEffect } from "react";
import { SyncEngine } from "@saasdeep/google-drive-sync";
import type { SyncState } from "@saasdeep/shared";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}

function getStoredTokens(): StoredTokens | null {
  try {
    const raw = localStorage.getItem("saasdeep_drive_tokens");
    if (!raw) return null;
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

export function useDrive() {
  const [syncState, setSyncState] = useState<SyncState>({
    status: "idle",
    lastSyncAt: null,
    lastMutationId: null,
    error: null,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [engine, setEngine] = useState<SyncEngine | null>(null);

  const connect = useCallback(async (tokens: StoredTokens) => {
    try {
      localStorage.setItem("saasdeep_drive_tokens", JSON.stringify(tokens));
      const syncEngine = new SyncEngine(tokens.accessToken);
      await syncEngine.initialize();
      setEngine(syncEngine);
      setIsAuthenticated(true);
      setSyncState({ status: "success", lastSyncAt: Date.now(), lastMutationId: null, error: null });
    } catch (err) {
      setSyncState({ status: "error", lastSyncAt: null, lastMutationId: null, error: (err as Error).message });
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem("saasdeep_drive_tokens");
    setEngine(null);
    setIsAuthenticated(false);
    setSyncState({ status: "idle", lastSyncAt: null, lastMutationId: null, error: null });
  }, []);

  const pushJsonFile = useCallback(async (filename: string, data: unknown) => {
    if (!engine) throw new Error("Drive not connected");
    return engine.pushJsonFile(filename, data);
  }, [engine]);

  const getAuthUrl = useCallback(() => {
    const redirectUri = `${window.location.origin}/api/drive/callback`;
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/drive.file",
      access_type: "offline",
      prompt: "consent",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }, []);

  useEffect(() => {
    const tokens = getStoredTokens();
    if (tokens && tokens.expiryDate > Date.now()) {
      connect(tokens);
    }
  }, [connect]);

  return {
    syncState,
    isAuthenticated,
    engine,
    connect,
    disconnect,
    pushJsonFile,
    getAuthUrl,
  };
}
