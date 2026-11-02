"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useResumeStore } from "@/store/useResumeStore";
import { SidebarEditor } from "@/components/editor/SidebarEditor";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { ExportBar } from "@/components/export/ExportBar";
import { LayoutControls } from "@/components/editor/LayoutControls";
import t, { setLocale } from "@/lib/i18n";
import { ACCENT_COLOR_OPTIONS, MAX_FONT_SCALE, MIN_FONT_SCALE, TEMPLATE_NAMES } from "@/types";
import type { TemplateName } from "@/types";

const AiAssistantPanel = dynamic(
  () => import("@/components/ai/AiAssistantPanel").then((m) => m.AiAssistantPanel),
  { ssr: false }
);

type WorkspaceTab = "edit" | "ai" | "layout" | "export";

const WORKSPACE_TABS: { key: WorkspaceTab; labelKey: string; code: string }[] = [
  { key: "edit", labelKey: "workspace.edit", code: "01" },
  { key: "ai", labelKey: "workspace.aiAssist", code: "02" },
  { key: "layout", labelKey: "workspace.layout", code: "03" },
  { key: "export", labelKey: "workspace.export", code: "04" },
];

export default function Home() {
  const {
    activeLanguage,
    setActiveLanguage,
    template,
    setTemplate,
    fontScale,
    stepFontScale,
    resetFontScale,
    accentColor,
    setAccentColor,
  } = useResumeStore();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("edit");
  const activeTabMeta = WORKSPACE_TABS.find((tab) => tab.key === activeTab) ?? WORKSPACE_TABS[0];

  useEffect(() => {
    setLocale(activeLanguage);
  }, [activeLanguage]);

  const renderWorkspaceContent = () => {
    switch (activeTab) {
      case "edit":
        return <SidebarEditor />;
      case "ai":
        return <AiAssistantPanel />;
      case "layout":
        return (
          <div className="workspace-inner">
            <LayoutControls />
          </div>
        );
      case "export":
        return (
          <div className="workspace-inner">
            <ExportBar />
          </div>
        );
      default:
        return <SidebarEditor />;
    }
  };

  return (
    <div className="app-shell">
      <header className="studio-header no-print">
        <div className="studio-brand">
          <div className="studio-brand-mark">RB</div>
          <div className="studio-brand-copy">
            <span>Resume Studio</span>
            <h1>{t("app.title")}</h1>
          </div>
        </div>

        <div className="studio-header-actions">
          <div className="studio-status-strip" aria-label={t("app.subtitle")}>
            <span>Local draft</span>
            <span>AI assisted</span>
            <span>Export ready</span>
          </div>

          <div className="template-switcher" aria-label={t("templates.switchTemplate")}>
            {(Object.keys(TEMPLATE_NAMES) as TemplateName[]).map((tmpl) => (
              <button
                key={tmpl}
                onClick={() => setTemplate(tmpl)}
                className={template === tmpl ? "is-active" : ""}
              >
                {TEMPLATE_NAMES[tmpl][activeLanguage]}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const next = activeLanguage === "zh" ? "en" : "zh";
              setActiveLanguage(next);
              setLocale(next);
            }}
            className="language-switch"
          >
            {activeLanguage === "zh" ? "EN" : "中文"}
          </button>
        </div>
      </header>

      <div className="studio-trust-strip no-print" aria-label={t("app.subtitle")}>
        <span>{t("app.subtitle")}</span>
        <span>Structured sections</span>
        <span>Template parity</span>
        <span>Print-safe preview</span>
      </div>

      <div className="studio-layout">
        <aside className="workspace-panel no-print">
          <div className="workspace-panel-header">
            <div>
              <span className="panel-kicker">Workspace {activeTabMeta.code}</span>
              <h2>{t(activeTabMeta.labelKey)}</h2>
            </div>
            <span className="panel-state">Live</span>
          </div>

          <div className="workspace-tabs" role="tablist" aria-label="Workspace tools">
            {WORKSPACE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                aria-pressed={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`workspace-tab ${activeTab === tab.key ? "workspace-tab--active" : ""}`}
              >
                <span>{tab.code}</span>
                <strong>{t(tab.labelKey)}</strong>
              </button>
            ))}
          </div>

          <div className="workspace-content">
            {renderWorkspaceContent()}
          </div>

          <div className="privacy-note">
            <span>Private by design</span>
            <p>{t("ai.privacyNotice")}</p>
          </div>
        </aside>

        <main className="preview-stage">
          <div className="preview-toolbar no-print">
            <div>
              <span className="panel-kicker">Preview canvas</span>
              <h2>{TEMPLATE_NAMES[template][activeLanguage]}</h2>
            </div>
            <div className="preview-toolbar-controls">
              <div
                className="accent-swatch-picker"
                role="group"
                aria-label={activeLanguage === "zh" ? "简历强调色切换" : "Resume accent color"}
              >
                <span className="accent-swatch-label">
                  {activeLanguage === "zh" ? "色调" : "Tone"}
                </span>
                {ACCENT_COLOR_OPTIONS.map((opt) => {
                  const active = accentColor === opt.key;
                  const label = opt.label[activeLanguage] || opt.label.zh;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setAccentColor(opt.key)}
                      aria-pressed={active}
                      aria-label={label}
                      title={label}
                      className={`accent-swatch-dot ${active ? "is-active" : ""}`}
                      style={{ backgroundColor: opt.swatch }}
                    />
                  );
                })}
              </div>
              <div
                className="font-scale-stepper"
                role="group"
                aria-label={activeLanguage === "zh" ? "简历字号调节" : "Resume font size"}
              >
                <span className="font-scale-label">
                  {activeLanguage === "zh" ? "字号" : "Font"}
                </span>
                <button
                  type="button"
                  onClick={() => stepFontScale(-1)}
                  disabled={fontScale <= MIN_FONT_SCALE}
                  aria-label={activeLanguage === "zh" ? "缩小字号" : "Decrease font size"}
                  title={activeLanguage === "zh" ? "缩小字号 (-5%)" : "Decrease font size (-5%)"}
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={resetFontScale}
                  className="font-scale-value"
                  title={activeLanguage === "zh" ? "点击重置为默认字号 (100%)" : "Click to reset to default (100%)"}
                >
                  {Math.round(fontScale * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => stepFontScale(1)}
                  disabled={fontScale >= MAX_FONT_SCALE}
                  aria-label={activeLanguage === "zh" ? "放大字号" : "Increase font size"}
                  title={activeLanguage === "zh" ? "放大字号 (+5%)" : "Increase font size (+5%)"}
                >
                  +
                </button>
              </div>
              <div className="preview-toolbar-meta">
                <span>A4</span>
                <span>{activeLanguage === "zh" ? "中文" : "English"}</span>
              </div>
            </div>
          </div>
          <div className="preview-canvas-wrap">
            <PreviewPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
