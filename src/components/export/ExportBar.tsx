"use client";

import { useState, useRef } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { downloadJSON, importFromJSON } from "@/lib/export/json";
import { downloadSVG } from "@/lib/export/svg";
import t from "@/lib/i18n";
import { ShutdownButton } from "@/components/runtime/ShutdownButton";
import { normalizeSectionOrder } from "@/lib/resume/sectionOrder";
import type { AccentColor, ResumeData, TemplateName, SectionKey, SectionEmphasis } from "@/types/resume";

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

export function ExportBar() {
  const store = useResumeStore();
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handlePrintPDF = () => {
    const payload: PrintPayload = {
      data: store.data,
      template: store.template,
      sectionOrder: normalizeSectionOrder(store.sectionOrder),
      emphasis: store.emphasis,
      language: store.activeLanguage,
      fontScale: store.fontScale,
      accentColor: store.accentColor,
      createdAt: Date.now(),
    };
    sessionStorage.setItem("resume-export-payload", JSON.stringify(payload));
    const printWindow = window.open("/export", "_blank");
    if (!printWindow) {
      sessionStorage.removeItem("resume-export-payload");
      showFeedback(t("export.popupBlocked"));
      return;
    }
    sessionStorage.removeItem("resume-export-payload");
  };

  const handleExportSVG = () => {
    try {
      downloadSVG({
        data: store.data,
        sectionOrder: normalizeSectionOrder(store.sectionOrder),
        emphasis: store.emphasis,
        language: store.activeLanguage,
        fontScale: store.fontScale,
        template: store.template,
      });
    } catch (err) {
      console.error("SVG export failed:", err);
      showFeedback(t("export.svgFailed"));
    }
  };

  const handleExportJSON = () => {
    try {
      downloadJSON(store.data);
    } catch (err) {
      console.error("JSON export failed:", err);
    }
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const imported = importFromJSON(content);
      if (imported) {
        store.loadResumeData(imported);
        showFeedback(t("export.importSuccess"));
      } else {
        showFeedback(t("export.importFailed"));
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="no-print export-actions-panel">
      <div className="export-action-grid">
        <button onClick={handlePrintPDF} className="btn-primary">
          {t("export.oneClickPdf")}
        </button>
        <button onClick={handleExportSVG} className="btn-secondary">
          {t("export.svg")}
        </button>
        <button onClick={handleExportJSON} className="btn-secondary">
          {t("export.json")}
        </button>
        <button onClick={handleImportJSON} className="btn-secondary">
          {t("export.importJson")}
        </button>
      </div>

      <div className="export-secondary-row">
        {feedback && (
          <span className="text-xs font-semibold text-[var(--color-accent)]">{feedback}</span>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm(t("export.loadDemoConfirm"))) {
                store.loadDemoData();
              }
            }}
            title={t("export.loadDemoTitle")}
            className="btn-secondary"
          >
            {t("export.loadDemo")}
          </button>
          <button
            onClick={() => {
              if (confirm(t("export.resetConfirm"))) {
                store.resetResumeData();
              }
            }}
            className="btn-danger"
          >
            {t("editor.reset")}
          </button>
          <ShutdownButton />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
