"use client";

/**
 * Shared visual system for the resume templates.
 *
 * Design principles (applied by every template):
 * 1. A short, high-contrast type scale (name / section / entry title / body / meta)
 *    with proportional scaling (`fontScale`) so users can step all font sizes up or down
 *    via -/+ while dependent layout metrics (indents, gutters, 2-column thresholds) adapt.
 * 2. Three ink levels only: strong (titles), body (content), meta (dates, tech, links).
 *    Content stays dark enough to read; only secondary metadata is grey.
 * 3. F-pattern scanning: titles, section headings, descriptions and bullet text share
 *    one strong left edge; dates sit on a clean right edge with tabular numbers;
 *    quantified results inside bullets get a subtle weight bump as secondary fixations.
 * 4. Standard 1-inch ID photo proportions converted to A4 (210×297mm = 794×1123px):
 *    25×35mm ≈ 90×126px (3:4 / 5:7 standard resume ID photo box).
 */

import type { CSSProperties, ReactNode } from "react";
import type { AccentColor, BilingualText } from "@/types";
import { clampFontScale, normalizeAccentColor } from "@/types";

export type Lang = "zh" | "en";

export const FONT_FAMILY =
  "system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif";

/** Base type scale in px at fontScale = 1.0 (A4 @ 96dpi: 1px ≈ 0.75pt). */
export const TYPE = {
  name: 26,
  headline: 12.5,
  section: 13.5,
  entryTitle: 12,
  body: 11,
  meta: 10,
  tag: 9.5,
} as const;

/** Line heights: CJK body text stays comfortable and readable at 1.45. */
export const LEADING = {
  title: 1.4,
  body: 1.45,
  meta: 1.4,
} as const;

export const INK = {
  strong: "#111827",
  body: "#374151",
  meta: "#6b7280",
  faint: "#9ca3af",
  rule: "#d1d5db",
  hairline: "#e5e7eb",
  tagBg: "#f3f4f6",
} as const;

export const NUMERIC: CSSProperties = { fontVariantNumeric: "tabular-nums" };

export interface AccentPalette {
  key: AccentColor;
  /** Primary structural accent (section indicator bar, section rule, gutter heading) */
  accent: string;
  /** Restrained secondary tone (headline title, muted emphasis) */
  subtitle: string;
  /** Bullet marker tone */
  marker: string;
  /** Fine inline hairline rule */
  rule: string;
  /** Subtle matte paper tint for compact section header bands */
  bandBg: string;
  /** LevelTag text / border / background */
  tagText: string;
  tagBorder: string;
  tagBg: string;
  /** ModernTemplate dark sidebar tones */
  sidebarBg: string;
  sidebarAccent: string;
  sidebarMuted: string;
}

export const ACCENT_PALETTES: Record<AccentColor, AccentPalette> = {
  obsidian: {
    key: "obsidian",
    accent: "#18181b",
    subtitle: "#3f3f46",
    marker: "#71717a",
    rule: "#e4e4e7",
    bandBg: "#f4f4f5",
    tagText: "#3f3f46",
    tagBorder: "#d4d4d8",
    tagBg: "#fafafa",
    sidebarBg: "#18181b",
    sidebarAccent: "#d4d4d8",
    sidebarMuted: "#a1a1aa",
  },
  navy: {
    key: "navy",
    accent: "#1e3a5f",
    subtitle: "#334155",
    marker: "#64748b",
    rule: "#dbe3ec",
    bandBg: "#f1f5f9",
    tagText: "#334155",
    tagBorder: "#cbd5e1",
    tagBg: "#f8fafc",
    sidebarBg: "#17253b",
    sidebarAccent: "#93c5fd",
    sidebarMuted: "#94a3b8",
  },
  charcoal: {
    key: "charcoal",
    accent: "#334155",
    subtitle: "#475569",
    marker: "#64748b",
    rule: "#e2e8f0",
    bandBg: "#f3f5f8",
    tagText: "#475569",
    tagBorder: "#cbd5e1",
    tagBg: "#f8fafc",
    sidebarBg: "#1e293b",
    sidebarAccent: "#cbd5e1",
    sidebarMuted: "#94a3b8",
  },
  forest: {
    key: "forest",
    accent: "#1b4332",
    subtitle: "#2d5a45",
    marker: "#52796f",
    rule: "#d8e3dd",
    bandBg: "#f1f6f3",
    tagText: "#2d5a45",
    tagBorder: "#c5d6cd",
    tagBg: "#f6f9f7",
    sidebarBg: "#162e24",
    sidebarAccent: "#a7f3d0",
    sidebarMuted: "#95b1a3",
  },
  burgundy: {
    key: "burgundy",
    accent: "#5c1d24",
    subtitle: "#6e3239",
    marker: "#8c585e",
    rule: "#e6d8da",
    bandBg: "#f7f2f3",
    tagText: "#5c1d24",
    tagBorder: "#dcc4c7",
    tagBg: "#faf6f6",
    sidebarBg: "#2d1518",
    sidebarAccent: "#eecad0",
    sidebarMuted: "#bfa3a6",
  },
};

export function resolveAccentPalette(color?: AccentColor): AccentPalette {
  return ACCENT_PALETTES[normalizeAccentColor(color)];
}

/**
 * Compute proportionally scaled typography and spacing helpers for a given `fontScale`.
 */
export function createTypeScale(rawScale = 1) {
  const s = clampFontScale(rawScale);
  const fs = (px: number) => Math.round(px * s * 100) / 100;
  // Vertical spacing adapts gently so enlarged text breathes without exploding page height
  const sp = (px: number) => Math.round(px * (0.75 + 0.25 * s) * 10) / 10;
  return {
    scale: s,
    fs,
    sp,
    name: fs(TYPE.name),
    headline: fs(TYPE.headline),
    section: fs(TYPE.section),
    entryTitle: fs(TYPE.entryTitle),
    body: fs(TYPE.body),
    meta: fs(TYPE.meta),
    tag: fs(TYPE.tag),
  };
}

export function pickText(b: BilingualText | undefined | null, lang: Lang): string {
  if (!b) return "";
  return lang === "zh" ? b.zh || b.en : b.en || b.zh;
}

/** Strip protocol / www / trailing slash so links read cleanly on paper. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}

/** Section heading tracking: CJK headings breathe with wider tracking; Latin stays tight. */
export function headingTracking(lang: Lang): string {
  return lang === "zh" ? "0.12em" : "0.06em";
}

/**
 * Inline Markdown-style `**text**` bold syntax.
 * Users can wrap any keyword, metric, or phrase in `**...**` to control emphasis manually.
 */
const BOLD_RE = /\*\*([^*\n]+?)\*\*/g;

export function stripMarkdownBold(text: string): string {
  return text ? text.replace(BOLD_RE, "$1") : "";
}

export function emphasizeMetrics(text: string, style?: CSSProperties): ReactNode {
  if (!text) return text;
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(BOLD_RE)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    out.push(
      <strong key={start} style={{ fontWeight: 600, color: INK.strong, ...style }}>
        {m[1]}
      </strong>,
    );
    last = start + m[0].length;
  }
  if (out.length === 0) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Bullet list with a hanging indent: the marker sits in the gutter and wrapped lines
 * align with the first line of text, keeping a clean reading edge.
 */
export function Bullets({
  items,
  style,
  markerColor = INK.faint,
  marker = "•",
  indent = 11,
  fontScale = 1,
  metricStyle,
}: {
  items: string[];
  style?: CSSProperties;
  markerColor?: string;
  marker?: string;
  indent?: number;
  fontScale?: number;
  metricStyle?: CSSProperties;
}) {
  const visible = items.filter(Boolean);
  if (visible.length === 0) return null;
  const scaledIndent = Math.round(indent * clampFontScale(fontScale) * 10) / 10;
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, ...style }}>
      {visible.map((text, i) => (
        <li key={i} style={{ display: "flex", alignItems: "baseline" }}>
          <span aria-hidden="true" style={{ flex: `0 0 ${scaledIndent}px`, color: markerColor }}>
            {marker}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>{emphasizeMetrics(text, metricStyle)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Inline list joined by quiet separators (used for contact rows, tech stacks …). */
export function InlineList({
  items,
  separator = "·",
  separatorColor = INK.faint,
  gap = 6,
  style,
}: {
  items: ReactNode[];
  separator?: string;
  separatorColor?: string;
  gap?: number;
  style?: CSSProperties;
}) {
  const visible = items.filter((item) => item !== null && item !== undefined && item !== "");
  if (visible.length === 0) return null;
  return (
    <span style={style}>
      {visible.map((item, i) => (
        <span key={i}>
          {i > 0 && (
            <span aria-hidden="true" style={{ color: separatorColor, margin: `0 ${gap}px` }}>
              {separator}
            </span>
          )}
          {item}
        </span>
      ))}
    </span>
  );
}

/**
 * One-line entry header: bold title + regular subtitle on the left edge,
 * date on the right edge (tabular, never wraps).
 */
export function EntryHeader({
  title,
  subtitle,
  date,
  fontScale = 1,
  titleStyle,
  subtitleStyle,
  dateStyle,
  separator = " · ",
}: {
  title: string;
  subtitle?: string;
  date?: string;
  fontScale?: number;
  titleStyle?: CSSProperties;
  subtitleStyle?: CSSProperties;
  dateStyle?: CSSProperties;
  separator?: string;
}) {
  const ts = createTypeScale(fontScale);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, lineHeight: LEADING.title }}>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontWeight: 700, fontSize: ts.entryTitle, color: INK.strong, ...titleStyle }}>{stripMarkdownBold(title)}</span>
        {subtitle && (
          <span style={{ fontWeight: 400, fontSize: ts.entryTitle, color: INK.body, ...subtitleStyle }}>
            {title ? separator : ""}
            {emphasizeMetrics(subtitle)}
          </span>
        )}
      </div>
      {date && (
        <span style={{ fontSize: ts.meta, color: INK.meta, whiteSpace: "nowrap", flexShrink: 0, ...NUMERIC, ...dateStyle }}>
          {stripMarkdownBold(date)}
        </span>
      )}
    </div>
  );
}

/** Small level tag (国家级 / National …) — a restrained hairline-framed editorial label. */
export function LevelTag({
  children,
  fontScale = 1,
  accentColor,
  style,
}: {
  children: ReactNode;
  fontScale?: number;
  accentColor?: AccentColor;
  style?: CSSProperties;
}) {
  const ts = createTypeScale(fontScale);
  const palette = resolveAccentPalette(accentColor);
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: ts.tag,
        lineHeight: 1.3,
        padding: "0.5px 4.5px",
        marginLeft: 6,
        borderRadius: 2,
        color: palette.tagText,
        background: palette.tagBg,
        border: `0.75px solid ${palette.tagBorder}`,
        fontWeight: 500,
        letterSpacing: "0.02em",
        verticalAlign: "1px",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function PhotoSlot({
  src,
  lang,
  width,
  height,
  radius = 3,
  border = `1px solid ${INK.rule}`,
  placeholderBorder = `1px dashed ${INK.rule}`,
  placeholderColor = INK.faint,
}: {
  src: string;
  lang: Lang;
  width: number;
  height: number;
  radius?: number;
  border?: string;
  placeholderBorder?: string;
  placeholderColor?: string;
}) {
  if (src) {
    return (
      <div style={{ width, height, borderRadius: radius, overflow: "hidden", flexShrink: 0, border }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  // On-screen hint only; hidden in print via `.resume-photo-placeholder` (globals.css).
  return (
    <div
      className="resume-photo-placeholder"
      style={{
        width,
        height,
        borderRadius: radius,
        flexShrink: 0,
        border: placeholderBorder,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9.5,
        color: placeholderColor,
        boxSizing: "border-box",
      }}
    >
      {lang === "zh" ? "证件照" : "Photo"}
    </div>
  );
}

export const SECTION_LABELS: Record<string, BilingualText> = {
  personalInfo: { zh: "基本信息", en: "Profile" },
  summary: { zh: "个人简介", en: "Profile" },
  contact: { zh: "联系方式", en: "Contact" },
  education: { zh: "教育背景", en: "Education" },
  researchExperience: { zh: "科研经历", en: "Research" },
  honors: { zh: "荣誉奖项", en: "Honors & Awards" },
  experience: { zh: "实习经历", en: "Experience" },
  projects: { zh: "项目经历", en: "Projects" },
  campusActivities: { zh: "校园经历", en: "Campus Activities" },
  skills: { zh: "技能特长", en: "Skills" },
};

export function sectionLabel(key: string, lang: Lang): string {
  return pickText(SECTION_LABELS[key], lang) || key;
}

/** Education meta line pieces: supports `**...**` bold syntax in both GPA and coursework. */
export function educationMeta(
  edu: { gpa: string; courses: string[] },
  lang: Lang,
  gpaStyle?: CSSProperties,
): ReactNode[] {
  const parts: ReactNode[] = [];
  if (edu.gpa) {
    parts.push(
      <span key="gpa">
        GPA {emphasizeMetrics(edu.gpa, gpaStyle)}
      </span>,
    );
  }
  if (edu.courses && edu.courses.length > 0) {
    parts.push(
      <span key="courses">
        {lang === "zh" ? "主修课程：" : "Coursework: "}
        {emphasizeMetrics(edu.courses.join(lang === "zh" ? "、" : ", "))}
      </span>,
    );
  }
  return parts;
}

/** Project meta line pieces: tech stack + link on one row instead of two. */
export function projectMeta(proj: { tech: string[]; link: string }): ReactNode[] {
  const parts: ReactNode[] = [];
  if (proj.tech && proj.tech.length > 0) parts.push(emphasizeMetrics(proj.tech.join(" / ")));
  if (proj.link) parts.push(displayUrl(proj.link));
  return parts;
}

/** Rough rendered width in em: CJK glyphs are ~1em, spaces/dots ~0.28em, Latin/digits ~0.5em. */
export function textEm(s: string): number {
  let em = 0;
  for (const ch of stripMarkdownBold(s)) {
    if (/[\u2E80-\u9FFF\uFF00-\uFFEF]/.test(ch)) em += 1;
    else if (/[ ·.,:/|()-]/.test(ch)) em += 0.28;
    else em += 0.5;
  }
  return em;
}

/**
 * Honors with descriptions or long titles need full width; short ones flow into two columns.
 * When `fontScale` increases, `effectiveMaxEm` shrinks proportionally so awards automatically
 * reflow into a single full-width column before wrapping awkwardly.
 */
export function honorsFitTwoColumns(
  honors: { title: BilingualText; level: string; period: string; description: BilingualText }[],
  lang: Lang,
  maxEm = 27,
  fontScale = 1,
): boolean {
  const effectiveMaxEm = maxEm / clampFontScale(fontScale);
  return (
    honors.length > 1 &&
    honors.every(
      (h) =>
        !pickText(h.description, lang) &&
        textEm(pickText(h.title, lang)) + textEm(h.level) + textEm(h.period) + 2 <= effectiveMaxEm,
    )
  );
}

/**
 * Skill groups whose item lists are short can sit two per row; when `fontScale` increases,
 * `effectiveMaxEm` shrinks proportionally so long lists automatically reflow to 1 column.
 */
export function skillsFitTwoColumns(
  skills: { category: BilingualText; items: string[] }[],
  lang: Lang,
  maxEm = 24,
  fontScale = 1,
): boolean {
  const effectiveMaxEm = maxEm / clampFontScale(fontScale);
  return (
    skills.length >= 4 &&
    skills.every((s) => textEm(pickText(s.category, lang)) + 1.5 + textEm(s.items.join(" · ")) <= effectiveMaxEm)
  );
}

/**
 * Skills as an aligned label column ("编程语言 | TypeScript · …") — labels form a vertical
 * scan line on the left edge. Short lists flow into two groups per row.
 */
export function SkillsGrid({
  skills,
  lang,
  fontSize = TYPE.body,
  fontScale = 1,
  lineHeight = 1.5,
  labelColor = INK.strong,
  itemColor = INK.body,
  rowGap = 2,
  columnGap = 24,
  twoColumnMaxEm,
}: {
  skills: { id: string; category: BilingualText; items: string[] }[];
  lang: Lang;
  fontSize?: number;
  fontScale?: number;
  lineHeight?: number;
  labelColor?: string;
  itemColor?: string;
  rowGap?: number;
  columnGap?: number;
  twoColumnMaxEm?: number;
}) {
  if (skills.length === 0) return null;
  const ts = createTypeScale(fontScale);
  const twoCol = skillsFitTwoColumns(skills, lang, twoColumnMaxEm, fontScale);
  const columns = twoCol ? [skills.filter((_, i) => i % 2 === 0), skills.filter((_, i) => i % 2 === 1)] : [skills];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: twoCol ? "1fr 1fr" : "1fr",
        columnGap,
        fontSize: ts.fs(fontSize),
        lineHeight,
      }}
    >
      {columns.map((col, ci) => (
        <div key={ci} style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 9, rowGap, alignContent: "start" }}>
          {col.map((cat) => (
            <div key={cat.id} style={{ display: "contents" }}>
              <span style={{ fontWeight: 600, color: labelColor, whiteSpace: "nowrap" }}>{stripMarkdownBold(pickText(cat.category, lang))}</span>
              <span style={{ color: itemColor, minWidth: 0 }}>
                <InlineList items={cat.items.map((item) => emphasizeMetrics(item))} separator="·" gap={3.5} />
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Honors list: title + level tag on the left, date on the right. Without descriptions the
 * list flows into two columns, halving its height and balancing the line.
 */
export function HonorsGrid({
  honors,
  lang,
  fontSize = TYPE.body,
  fontScale = 1,
  accentColor,
  lineHeight = 1.5,
  titleColor = INK.strong,
  dateStyle,
  tagStyle,
  rowGap = 2,
  columnGap = 28,
  twoColumnMaxEm,
}: {
  honors: { id: string; title: BilingualText; level: string; period: string; description: BilingualText }[];
  lang: Lang;
  fontSize?: number;
  fontScale?: number;
  accentColor?: AccentColor;
  lineHeight?: number;
  titleColor?: string;
  dateStyle?: CSSProperties;
  tagStyle?: CSSProperties;
  rowGap?: number;
  columnGap?: number;
  twoColumnMaxEm?: number;
}) {
  if (honors.length === 0) return null;
  const ts = createTypeScale(fontScale);
  const twoCol = honorsFitTwoColumns(honors, lang, twoColumnMaxEm, fontScale);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: twoCol ? "1fr 1fr" : "1fr",
        columnGap,
        rowGap,
        fontSize: ts.fs(fontSize),
        lineHeight,
      }}
    >
      {honors.map((h) => (
        <div key={h.id} style={{ minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <span style={{ minWidth: 0 }}>
              <span style={{ fontWeight: 600, color: titleColor }}>{stripMarkdownBold(pickText(h.title, lang))}</span>
              {h.level && <LevelTag fontScale={fontScale} accentColor={accentColor} style={tagStyle}>{stripMarkdownBold(h.level)}</LevelTag>}
            </span>
            {h.period && (
              <span style={{ fontSize: ts.meta, color: INK.meta, whiteSpace: "nowrap", ...NUMERIC, ...dateStyle }}>{h.period}</span>
            )}
          </div>
          {pickText(h.description, lang) && (
            <div style={{ color: INK.body, marginTop: 1 }}>{emphasizeMetrics(pickText(h.description, lang))}</div>
          )}
        </div>
      ))}
    </div>
  );
}
