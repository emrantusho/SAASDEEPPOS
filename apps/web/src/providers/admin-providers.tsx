"use client";

import type { ReactNode } from "react";
import { DriveProvider } from "./drive-provider";

export function AdminProviders({ children }: { children: ReactNode }) {
  return <DriveProvider>{children}</DriveProvider>;
}
