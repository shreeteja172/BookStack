"use client";

import { useEffect, useRef, useState } from "react";

type BarcodeScannerProps = {
  onDetected: (value: string) => void;
};

type DetectorLike = {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
};

type Controls = { stop: () => void };

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controlsRef = useRef<Controls | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;
    let frame = 0;

    const cleanup = () => {
      cancelAnimationFrame(frame);
      controlsRef.current?.stop();
      controlsRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const finish = (value: string) => {
      onDetected(value.trim());
      cleanup();
      setActive(false);
    };

    async function runNative() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const Detector = (
        globalThis as unknown as {
          BarcodeDetector: new (options?: { formats?: string[] }) => DetectorLike;
        }
      ).BarcodeDetector;

      const detector = new Detector({
        formats: ["code_128", "code_39", "ean_13", "qr_code"],
      });

      const tick = async () => {
        if (cancelled || !videoRef.current) {
          return;
        }

        try {
          const results = await detector.detect(videoRef.current);

          if (results.length > 0 && results[0].rawValue) {
            finish(results[0].rawValue);
            return;
          }
        } catch {
          void 0;
        }

        frame = requestAnimationFrame(() => {
          void tick();
        });
      };

      void tick();
    }

    async function runZxing() {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();

      if (cancelled || !videoRef.current) {
        return;
      }

      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (result) {
            finish(result.getText());
          }
        },
      );

      if (cancelled) {
        controls.stop();
        return;
      }

      controlsRef.current = controls;
    }

    async function start() {
      try {
        if ("BarcodeDetector" in globalThis) {
          setEngine("native");
          await runNative();
        } else {
          setEngine("zxing");
          await runZxing();
        }
      } catch {
        if (!cancelled) {
          setError("Could not open the camera. Check the browser permission and try again.");
          setActive(false);
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [active, onDetected]);

  function stop() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }

  return (
    <div>
      <div className={active ? "space-y-3" : "hidden"}>
        <div className="relative overflow-hidden rounded-xl border border-line bg-black">
          <video ref={videoRef} className="h-56 w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-ember" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted">
            {engine === "zxing" ? "Using ZXing decoder" : "Using the browser scanner"}
          </span>
          <button
            type="button"
            onClick={stop}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted hover:border-ember hover:text-ember"
          >
            Stop camera
          </button>
        </div>
      </div>

      {active ? null : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setActive(true);
          }}
          className="w-full rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-brand hover:border-brand-light"
        >
          Scan barcode with camera
        </button>
      )}

      {error ? (
        <p role="alert" className="mt-3 rounded-lg bg-ember/10 px-4 py-2 text-sm text-ember">
          {error}
        </p>
      ) : null}
    </div>
  );
}
