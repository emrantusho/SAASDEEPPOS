import type { ProductsManifest } from "@saasdeep/shared";

const DRIVE_FILE_ID = process.env.NEXT_PUBLIC_DRIVE_FILE_ID ?? "";

export class DriveFetcher {
  private cache: { manifest: ProductsManifest; timestamp: number } | null = null;
  private cacheTtl = 60_000;

  async fetchManifest(): Promise<ProductsManifest | null> {
    if (this.cache && Date.now() - this.cache.timestamp < this.cacheTtl) {
      return this.cache.manifest;
    }

    try {
      const url = `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`;
      const res = await fetch(url);

      if (!res.ok) {
        console.error(`[DriveFetcher] Failed to fetch ${url}:`, res.status, res.statusText);
        return this.cache?.manifest ?? null;
      }

      const text = await res.text();
      let manifest: ProductsManifest;
      try {
        manifest = JSON.parse(text);
      } catch {
        console.error("[DriveFetcher] Invalid JSON from Drive file");
        return this.cache?.manifest ?? null;
      }

      if (!manifest.products) manifest.products = [];
      if (!manifest.collections) manifest.collections = [];

      this.cache = { manifest, timestamp: Date.now() };
      return manifest;
    } catch (err) {
      console.error("[DriveFetcher] Error fetching manifest:", err);
      return this.cache?.manifest ?? null;
    }
  }

  invalidateCache(): void {
    this.cache = null;
  }
}
