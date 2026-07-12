"use client";

import { useState, useRef, useCallback } from "react";
import { Scan, X, Camera } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [open, setOpen] = useState(false);
  const [supported, setSupported] = useState(true);
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setError("");
    try {
      if (!("BarcodeDetector" in window)) {
        setSupported(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      scanLoop();
    } catch {
      setError("Camera access denied");
      setSupported(false);
    }
  }, []);

  const scanLoop = useCallback(() => {
    if (!videoRef.current || !("BarcodeDetector" in window)) return;
    const detector = new (window as any).BarcodeDetector();
    const tick = async () => {
      if (!videoRef.current || streamRef.current === null) return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const rawValue = barcodes[0].rawValue;
          stopCamera();
          setOpen(false);
          onScan(rawValue);
          return;
        }
      } catch {}
      requestAnimationFrame(tick);
    };
    tick();
  }, [onScan]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setOpen(false);
      setManualInput("");
    }
  };

  const handleClose = () => {
    stopCamera();
    setOpen(false);
    setManualInput("");
    setError("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setTimeout(startCamera, 300); }}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Scan Barcode"
      >
        <Scan className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl max-w-sm w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Scan Barcode</h3>
              <button onClick={handleClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              {supported ? (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                  <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    <Camera className="h-5 w-5 mr-2" />
                    Point at a barcode
                  </div>
                </div>
              ) : null}

              {error && <p className="text-xs text-destructive mb-3">{error}</p>}

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter barcode manually"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
