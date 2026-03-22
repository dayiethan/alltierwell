"use client";

import { useEffect, useRef, useState } from "react";

interface CardPreviewModalProps {
  /** The API URL to fetch the OG image from */
  imageUrl: string;
  /** Filename for the download */
  downloadName: string;
  /** Called when the modal should close */
  onClose: () => void;
}

export default function CardPreviewModal({
  imageUrl,
  downloadName,
  onClose,
}: CardPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchImage = async () => {
      try {
        const res = await fetch(imageUrl);
        if (!res.ok) throw new Error(`${res.status}`);
        const blob = await res.blob();
        if (!cancelled) {
          setBlobUrl(URL.createObjectURL(blob));
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    fetchImage();
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = downloadName;
    a.click();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        className="relative w-full max-w-2xl rounded-xl border border-border overflow-hidden"
        style={{ backgroundColor: "var(--card)" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image area */}
        <div className="flex items-center justify-center bg-black/10 min-h-[200px]">
          {loading ? (
            <div className="py-16 text-sm text-muted-foreground">
              Generating card...
            </div>
          ) : blobUrl ? (
            <img
              src={blobUrl}
              alt="Shareable card preview"
              className="w-full h-auto"
            />
          ) : (
            <div className="py-16 text-sm text-muted-foreground">
              Failed to generate card.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 p-4">
          <button
            onClick={handleDownload}
            disabled={!blobUrl}
            className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Download
          </button>
          <button
            onClick={onClose}
            className="rounded-md border border-border px-5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
