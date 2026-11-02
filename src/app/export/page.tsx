"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { clampFontScale, normalizeAccentColor } from "@/types";
import type { AccentColor, ResumeData, TemplateName, SectionKey, SectionEmphasis } from "@/types";
import { ALL_SECTION_KEYS, normalizeSectionOrder } from "@/lib/resume/sectionOrder";

interface PrintPayload {
  data: ResumeData;
  template: TemplateName;
  sectionOrder: SectionKey[];
  emphasis: Partial<Record<SectionKey, SectionEmphasis>>;
  language: "zh" | "en";
  fontScale?: number;
  accentColor?: AccentColor;
  createdAt: number;
}

const TEMPLATE_NAMES: TemplateName[] = ["classic", "modern", "minimal", "compact"];
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTemplateName(value: unknown): value is TemplateName {
  return typeof value === "string" && (TEMPLATE_NAMES as string[]).includes(value);
}

function isLanguage(value: unknown): value is "zh" | "en" {
  return value === "zh" || value === "en";
}

function isSectionOrder(value: unknown): value is SectionKey[] {
  return Array.isArray(value);
}

function isSectionEmphasisMap(value: unknown): value is Partial<Record<SectionKey, SectionEmphasis>> {
  if (!isRecord(value)) return false;
  return Object.entries(value).every(
    ([key, item]) =>
      (ALL_SECTION_KEYS as readonly string[]).includes(key) &&
      (item === "expanded" || item === "normal" || item === "compact" || item === "hidden"),
  );
}

function isPrintPayload(value: unknown): value is PrintPayload {
  if (!isRecord(value)) return false;
  const candidate = value as Record<string, unknown>;
  return (
    isRecord(candidate.data) &&
    isTemplateName(candidate.template) &&
    isSectionOrder(candidate.sectionOrder) &&
    isLanguage(candidate.language) &&
    (candidate.emphasis === undefined || isSectionEmphasisMap(candidate.emphasis))
  );
}

function readPrintPayload(): PrintPayload | null {
  try {
    const raw = sessionStorage.getItem("resume-export-payload");
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isPrintPayload(parsed)) {
      sessionStorage.removeItem("resume-export-payload");
      return null;
    }
    return {
      ...parsed,
      sectionOrder: normalizeSectionOrder(parsed.sectionOrder),
      emphasis: parsed.emphasis ?? {},
      fontScale: clampFontScale(parsed.fontScale),
      accentColor: normalizeAccentColor(parsed.accentColor),
      createdAt: typeof parsed.createdAt === "number" ? parsed.createdAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function waitForPreviewElement(): Promise<HTMLElement> {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const preview = document.getElementById("resume-preview");
    const rect = preview?.getBoundingClientRect();
    if (preview && rect && rect.width > 0 && rect.height > 0) {
      return preview;
    }
    await waitForNextFrame();
  }
  throw new Error("Timed out waiting for #resume-preview to become measurable.");
}

async function waitForFontsReady(): Promise<void> {
  const fonts = "fonts" in document ? document.fonts : undefined;
  await fonts?.ready;
}

function waitForImageReady(image: HTMLImageElement): Promise<void> {
  if (image.complete && image.naturalWidth > 0) {
    return Promise.resolve();
  }
  if (typeof image.decode === "function") {
    return image.decode().catch(() => {
      if (image.complete) return;
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    });
  }
  return new Promise((resolve) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => resolve(), { once: true });
  });
}

async function waitForPreviewImages(preview: HTMLElement): Promise<void> {
  const images = Array.from(preview.querySelectorAll("img"));
  await Promise.all(images.map(waitForImageReady));
}

async function prepareAndPrint(): Promise<void> {
  const preview = await waitForPreviewElement();
  await waitForFontsReady();
  await waitForPreviewImages(preview);
  await waitForNextFrame();
  await waitForNextFrame();
  preview.dataset.exportReady = "true";
  window.print();
}

export default function ExportPage() {
  const [payload, setPayload] = useState<PrintPayload | null>(null);
  const [noPayload, setNoPayload] = useState(false);
  const [renderedTick, setRenderedTick] = useState(0);
  const [printError, setPrintError] = useState<string | null>(null);
  const printStartedRef = useRef(false);

  useEffect(() => {
    document.title = "Resume Builder Export";

    const nextPayload = readPrintPayload();
    if (!nextPayload) {
      requestAnimationFrame(() => setNoPayload(true));
      return;
    }

    requestAnimationFrame(() => setPayload(nextPayload));

    const onAfterPrint = () => {
      sessionStorage.removeItem("resume-export-payload");
    };
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  const handleRendered = useCallback(() => {
    setRenderedTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    if (!payload || renderedTick === 0 || printStartedRef.current) return;

    printStartedRef.current = true;
    prepareAndPrint().catch((error: unknown) => {
      printStartedRef.current = false;
      setPrintError(error instanceof Error ? error.message : "Print preparation failed.");
    });
  }, [payload, renderedTick]);

  if (noPayload) {
    return (
      <div className="print-empty-state">
        <div className="print-empty-card">
          <div className="panel-kicker">Export session</div>
          <h1 className="mt-2 text-lg font-semibold text-[var(--color-text)]">未找到导出数据</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">请返回主页面重新导出。</p>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="print-loading-state">
        <div className="print-loading-card">
          <div className="panel-kicker">Preparing export</div>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-container" style={{ display: "flex", justifyContent: "center", padding: "0", background: "white" }}>
      {printError && (
        <div className="no-print" role="alert" style={{ position: "fixed", top: 12, left: 12, right: 12, zIndex: 1, padding: "10px 14px", fontFamily: "var(--font-sans)", fontSize: "12px", color: "#991b1b", background: "#fff7f7", border: "1px solid #fecaca", borderRadius: "14px" }}>
          {printError}
        </div>
      )}
      <PreviewPanel
        exportMode
        onRendered={handleRendered}
        snapshot={{
          data: payload.data,
          template: payload.template,
          sectionOrder: payload.sectionOrder,
          emphasis: payload.emphasis,
          language: payload.language,
          fontScale: payload.fontScale,
          accentColor: payload.accentColor,
        }}
      />
    </div>
  );
}
