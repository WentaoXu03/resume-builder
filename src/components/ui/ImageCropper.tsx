"use client";

import { useState } from "react";
import {
  AVATAR_CROP_ASPECT_RATIO,
  AVATAR_OUTPUT_HEIGHT,
  AVATAR_OUTPUT_WIDTH,
  loadImage,
} from "@/lib/image/avatarImage";
import t from "@/lib/i18n";

interface ImageCropperProps {
  imageDataUrl: string;
  language: "zh" | "en";
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageDataUrl, language, onConfirm, onCancel }: ImageCropperProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{
    pointerId: number;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setBusy(true);
    setError("");

    try {
      const image = await loadImage(imageDataUrl);
      const canvas = document.createElement("canvas");
      canvas.width = AVATAR_OUTPUT_WIDTH;
      canvas.height = AVATAR_OUTPUT_HEIGHT;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas context unavailable.");
      }

      const sourceWidth = image.naturalWidth || image.width;
      const sourceHeight = image.naturalHeight || image.height;
      const sourceAspect = sourceWidth / sourceHeight;
      let cropWidth = sourceWidth;
      let cropHeight = sourceHeight;

      if (sourceAspect > AVATAR_CROP_ASPECT_RATIO) {
        cropWidth = sourceHeight * AVATAR_CROP_ASPECT_RATIO;
      } else {
        cropHeight = sourceWidth / AVATAR_CROP_ASPECT_RATIO;
      }

      cropWidth = Math.max(1, cropWidth / zoom);
      cropHeight = Math.max(1, cropHeight / zoom);

      const previewWidth = 176;
      const previewHeight = previewWidth / AVATAR_CROP_ASPECT_RATIO;
      const cropX = Math.min(
        Math.max(0, (sourceWidth - cropWidth) / 2 - offset.x * (cropWidth / previewWidth)),
        sourceWidth - cropWidth,
      );
      const cropY = Math.min(
        Math.max(0, (sourceHeight - cropHeight) / 2 - offset.y * (cropHeight / previewHeight)),
        sourceHeight - cropHeight,
      );

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        AVATAR_OUTPUT_WIDTH,
        AVATAR_OUTPUT_HEIGHT,
      );

      onConfirm(canvas.toDataURL("image/jpeg", 0.96));
    } catch (err) {
      console.error("Avatar crop failed:", err);
      setError(t("avatar.cropFailed"));
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("avatar.cropTitle")}
      data-language={language}
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">{t("avatar.cropTitle")}</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t("avatar.cropDescription")}</p>
        </div>

        <div
          className="mx-auto w-44 cursor-grab overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] active:cursor-grabbing"
          style={{ aspectRatio: "3 / 4", touchAction: "none" }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragStart({
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              offsetX: offset.x,
              offsetY: offset.y,
            });
          }}
          onPointerMove={(event) => {
            if (!dragStart || dragStart.pointerId !== event.pointerId) return;
            setOffset({
              x: dragStart.offsetX + event.clientX - dragStart.x,
              y: dragStart.offsetY + event.clientY - dragStart.y,
            });
          }}
          onPointerUp={(event) => {
            if (dragStart?.pointerId === event.pointerId) {
              event.currentTarget.releasePointerCapture(event.pointerId);
              setDragStart(null);
            }
          }}
          onPointerCancel={() => setDragStart(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageDataUrl}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: "center",
            }}
          />
        </div>

        <label className="field-label mt-4 block">{t("avatar.zoom")}</label>
        <input
          type="range"
          min="1"
          max="3"
          step="0.05"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="w-full"
        />

        {error && <div className="mt-2 text-xs text-red-600">{error}</div>}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={onCancel} disabled={busy}>
            {t("avatar.cropCancel")}
          </button>
          <button type="button" className="btn-primary px-3 py-1.5 text-xs" onClick={handleConfirm} disabled={busy}>
            {busy ? t("avatar.cropping") : t("avatar.cropConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
