"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { ACCENT_COLOR_OPTIONS, MAX_FONT_SCALE, MIN_FONT_SCALE, SECTION_LABELS } from "@/types";
import type { SectionKey } from "@/types";
import t from "@/lib/i18n";
import { getControllableSectionOrder } from "@/lib/resume/sectionOrder";

function reorderSections(sections: SectionKey[], from: SectionKey, to: SectionKey): SectionKey[] {
  const fromIndex = sections.indexOf(from);
  const toIndex = sections.indexOf(to);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return sections;

  const next = [...sections];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function LayoutControls() {
  const {
    sectionOrder,
    emphasis,
    activeLanguage,
    fontScale,
    accentColor,
    setSectionOrder,
    toggleSectionVisibility,
    stepFontScale,
    resetFontScale,
    setAccentColor,
  } = useResumeStore();
  const [draggingSection, setDraggingSection] = useState<SectionKey | null>(null);
  const orderedSections = getControllableSectionOrder(sectionOrder);

  const commitOrder = (nextControllableOrder: SectionKey[]) => {
    setSectionOrder(["personalInfo", ...nextControllableOrder]);
  };

  const moveByOffset = (section: SectionKey, offset: number) => {
    const currentIndex = orderedSections.indexOf(section);
    const nextIndex = currentIndex + offset;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedSections.length) return;

    const next = [...orderedSections];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(nextIndex, 0, moved);
    commitOrder(next);
  };

  return (
    <section className="section-card mb-4" aria-label={t("layout.title")}>
      <div className="mb-3 flex items-center justify-between gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2.5">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[var(--color-text)]">
            {activeLanguage === "zh" ? "全局字号比例" : "Font Scale"}
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)]">
            {activeLanguage === "zh"
              ? "成比例缩放全篇字号与排版栅格 (85%–125%)"
              : "Proportionally scale all resume text & grid (85%–125%)"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            className="btn-secondary px-2.5 py-1 text-xs font-bold"
            disabled={fontScale <= MIN_FONT_SCALE}
            onClick={() => stepFontScale(-1)}
            aria-label={activeLanguage === "zh" ? "缩小字号" : "Decrease font size"}
          >
            −
          </button>
          <button
            type="button"
            className="btn-secondary min-w-[52px] px-2 py-1 text-center font-mono text-xs"
            onClick={resetFontScale}
            title={activeLanguage === "zh" ? "点击重置为 100%" : "Reset to 100%"}
          >
            {Math.round(fontScale * 100)}%
          </button>
          <button
            type="button"
            className="btn-secondary px-2.5 py-1 text-xs font-bold"
            disabled={fontScale >= MAX_FONT_SCALE}
            onClick={() => stepFontScale(1)}
            aria-label={activeLanguage === "zh" ? "放大字号" : "Increase font size"}
          >
            +
          </button>
        </div>
      </div>

      <div className="mb-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold text-[var(--color-text)]">
            {activeLanguage === "zh" ? "简历强调色调" : "Accent Tone"}
          </div>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {ACCENT_COLOR_OPTIONS.find((o) => o.key === accentColor)?.label[activeLanguage]}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ACCENT_COLOR_OPTIONS.map((opt) => {
            const active = accentColor === opt.key;
            const label = opt.label[activeLanguage] || opt.label.zh;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setAccentColor(opt.key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  active
                    ? "border-[var(--color-primary)] bg-white text-[var(--color-primary)] shadow-xs"
                    : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-white"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: opt.swatch }}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">{t("layout.title")}</h3>
        <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
          {t("layout.description")}
        </p>
      </div>

      <div className="space-y-2">
        {orderedSections.map((section) => {
          const hidden = emphasis[section] === "hidden";
          const label = SECTION_LABELS[section][activeLanguage] || SECTION_LABELS[section].zh;
          const isDragging = draggingSection === section;
          const currentIndex = orderedSections.indexOf(section);

          return (
            <div
              key={section}
              className={`flex items-center justify-between gap-3 rounded-[14px] border border-[var(--color-border)] px-3 py-2 transition ${isDragging ? "bg-[var(--color-bg-tertiary)] opacity-70" : "bg-white"}`}
              draggable
              onDragStart={(event) => {
                setDraggingSection(section);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", section);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                const source = draggingSection ?? event.dataTransfer.getData("text/plain");
                if (!source) return;
                commitOrder(reorderSections(orderedSections, source as SectionKey, section));
                setDraggingSection(null);
              }}
              onDragEnd={() => setDraggingSection(null)}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="select-none font-mono text-xs leading-none text-[var(--color-text-muted)]"
                  aria-label={`${t("layout.dragHandle")} ${label}`}
                  title={t("layout.dragHandle")}
                >
                  ::
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[var(--color-text)]">{label}</div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    {hidden ? t("layout.hidden") : t("layout.visible")}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  className="btn-secondary px-2 py-1 text-[11px]"
                  disabled={currentIndex === 0}
                  aria-label={`${t("layout.moveUp")} ${label}`}
                  onClick={() => moveByOffset(section, -1)}
                >
                  {t("layout.moveUp")}
                </button>
                <button
                  type="button"
                  className="btn-secondary px-2 py-1 text-[11px]"
                  disabled={currentIndex === orderedSections.length - 1}
                  aria-label={`${t("layout.moveDown")} ${label}`}
                  onClick={() => moveByOffset(section, 1)}
                >
                  {t("layout.moveDown")}
                </button>
                <button
                  type="button"
                  className={hidden ? "btn-secondary text-xs px-2.5 py-1" : "btn-danger text-xs px-2.5 py-1"}
                  aria-pressed={!hidden}
                  aria-label={`${hidden ? t("layout.show") : t("layout.hide")} ${label}`}
                  onClick={() => toggleSectionVisibility(section)}
                >
                  {hidden ? t("layout.show") : t("layout.hide")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
