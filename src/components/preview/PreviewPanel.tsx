"use client";

import { forwardRef, useEffect, useMemo } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { normalizeSectionOrder } from "@/lib/resume/sectionOrder";
import { RESUME_TOKENS } from "@/lib/templates/designTokens";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { CompactTemplate } from "@/components/templates/CompactTemplate";
import { clampFontScale, normalizeAccentColor } from "@/types";
import type { AccentColor, ResumeData, SectionEmphasis, SectionKey, TemplateName } from "@/types";

export interface PreviewSnapshot {
  data: ResumeData;
  template: TemplateName;
  sectionOrder: SectionKey[];
  emphasis: Partial<Record<SectionKey, SectionEmphasis>>;
  language: "zh" | "en";
  fontScale?: number;
  accentColor?: AccentColor;
}

interface PreviewPanelProps {
  snapshot?: PreviewSnapshot;
  exportMode?: boolean;
  onRendered?: () => void;
}

export const PreviewPanel = forwardRef<HTMLDivElement, PreviewPanelProps>(function PreviewPanel(
  { snapshot, exportMode = false, onRendered },
  ref,
) {
  const store = useResumeStore();
  const data = snapshot?.data ?? store.data;
  const template = snapshot?.template ?? store.template;
  const sectionOrder = snapshot?.sectionOrder ?? store.sectionOrder;
  const emphasis = snapshot?.emphasis ?? store.emphasis;
  const language = snapshot?.language ?? store.activeLanguage;
  const fontScale = clampFontScale(snapshot?.fontScale ?? store.fontScale);
  const accentColor = normalizeAccentColor(snapshot?.accentColor ?? store.accentColor);
  const normalizedSectionOrder = useMemo(
    () => normalizeSectionOrder(sectionOrder),
    [sectionOrder],
  );

  const props = {
    data,
    sectionOrder: normalizedSectionOrder,
    emphasis,
    language,
    fontScale,
    accentColor,
  };

  useEffect(() => {
    onRendered?.();
  }, [onRendered, data, template, normalizedSectionOrder, emphasis, language, fontScale, accentColor]);

  return (
    <div className={`preview-shell${exportMode ? " export-preview-shell" : ""}`}>
      <div
        ref={ref}
        id="resume-preview"
        data-template={template}
        data-language={language}
        data-font-scale={String(fontScale)}
        data-accent-color={accentColor}
        data-export-mode={exportMode ? "true" : "false"}
        className="resume-print-area"
        style={{
          width: `${RESUME_TOKENS.page.widthPx}px`,
          minHeight: `${RESUME_TOKENS.page.minHeightPx}px`,
        }}
      >
        {template === "modern" && <ModernTemplate {...props} />}
        {template === "minimal" && <MinimalTemplate {...props} />}
        {template === "compact" && <CompactTemplate {...props} />}
        {(template === "classic" || !["modern", "minimal", "compact"].includes(template)) && <ClassicTemplate {...props} />}
      </div>
    </div>
  );
});
