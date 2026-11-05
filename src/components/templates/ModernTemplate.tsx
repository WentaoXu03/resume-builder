"use client";

import type { AccentColor, ResumeData, SectionKey, SectionEmphasis } from "@/types";
import { RESUME_TEMPLATE_ROOT_STYLE, RESUME_TOKENS } from "@/lib/templates/designTokens";
import { normalizeSectionOrder } from "@/lib/resume/sectionOrder";
import {
  Bullets,
  EntryHeader,
  FONT_FAMILY,
  HonorsGrid,
  INK,
  InlineList,
  LEADING,
  NUMERIC,
  PhotoSlot,
  SchoolTierTag,
  createTypeScale,
  displayUrl,
  educationMeta,
  emphasizeMetrics,
  headingTracking,
  pickText,
  projectMeta,
  resolveAccentPalette,
  sectionLabel,
} from "./shared";

interface TemplateProps {
  data: ResumeData;
  sectionOrder: SectionKey[];
  emphasis: Partial<Record<SectionKey, SectionEmphasis>>;
  language: "zh" | "en";
  fontScale?: number;
  accentColor?: AccentColor;
}

/**
 * Modern — two-column layout with a dark sidebar (28%) and a wide main column (72%).
 *
 * Photo slot: standard 1-inch ID photo converted to A4 sidebar (86×118px).
 */
const PHOTO = { width: 103, height: 142 };
const MAIN_PAD = { top: 26, right: 28, bottom: 24, left: 26 };
const BASE_SPACE = { section: 12, headToBody: 6, entry: 9.6, line: 3 };

export function ModernTemplate({
  data,
  sectionOrder,
  emphasis,
  language,
  fontScale = 1,
  accentColor,
}: TemplateProps) {
  const t = (b: Parameters<typeof pickText>[0]) => pickText(b, language);
  const ts = createTypeScale(fontScale);
  const palette = resolveAccentPalette(accentColor);
  const SIDEBAR = {
    bg: palette.sidebarBg,
    text: "#f8fafc",
    body: "#e2e8f0",
    muted: palette.sidebarMuted,
    accent: palette.sidebarAccent,
    divider: "rgba(255, 255, 255, 0.12)",
    pillBg: "rgba(255, 255, 255, 0.09)",
  };
  const ACCENT = palette.accent;
  const SPACE = {
    section: ts.sp(BASE_SPACE.section),
    headToBody: ts.sp(BASE_SPACE.headToBody),
    entry: ts.sp(BASE_SPACE.entry),
    line: ts.fs(BASE_SPACE.line),
  };
  const normalizedSectionOrder = normalizeSectionOrder(sectionOrder);

  const bodyText = { fontSize: ts.body, color: INK.body, lineHeight: LEADING.body } as const;
  const metaText = { fontSize: ts.meta, color: INK.meta, lineHeight: LEADING.meta } as const;
  const entryStyle = (last: boolean) => ({ marginBottom: last ? 0 : SPACE.entry });

  const renderSidebarHeading = (label: string) => (
    <div
      style={{
        fontSize: ts.fs(12),
        fontWeight: 700,
        color: SIDEBAR.text,
        letterSpacing: headingTracking(language),
        textTransform: language === "en" ? "uppercase" : undefined,
        paddingBottom: 4,
        marginBottom: 7,
        borderBottom: `1.5px solid ${SIDEBAR.accent}`,
        lineHeight: 1.25,
      }}
    >
      {label}
    </div>
  );

  const renderSidebarPersonalInfo = () => {
    const info = data.personalInfo;
    const name = t(info.name);
    if (!name && !info.email) return null;

    const identity = [info.gender, info.birthDate, info.politicalStatus].filter(Boolean).join(" · ");
    const summary = t(info.summary);
    const contactRows: { label: string; value: string }[] = [];
    if (identity) contactRows.push({ label: language === "zh" ? "信息" : "Info", value: identity });
    if (info.phone) contactRows.push({ label: language === "zh" ? "电话" : "Tel", value: info.phone });
    if (info.email) contactRows.push({ label: language === "zh" ? "邮箱" : "Mail", value: info.email });
    if (t(info.location)) contactRows.push({ label: language === "zh" ? "城市" : "Loc", value: t(info.location) });
    if (info.website) contactRows.push({ label: language === "zh" ? "主页" : "Web", value: displayUrl(info.website) });

    return (
      <div>
        <div style={{ margin: "0 auto 10px", display: "flex", justifyContent: "center" }}>
          <PhotoSlot
            src={info.avatarUrl}
            lang={language}
            width={PHOTO.width}
            height={PHOTO.height}
            radius={3}
            border="1px solid rgba(255,255,255,0.25)"
            placeholderBorder="1px dashed rgba(255,255,255,0.28)"
            placeholderColor={SIDEBAR.muted}
          />
        </div>
        <div
          style={{
            fontSize: ts.fs(22),
            fontWeight: 700,
            color: SIDEBAR.text,
            textAlign: "center",
            lineHeight: 1.25,
            letterSpacing: language === "zh" ? "0.1em" : "0.02em",
            marginRight: language === "zh" ? "-0.1em" : 0,
          }}
        >
          {name}
        </div>
        {t(info.title) && (
          <div
            style={{
              fontSize: ts.fs(11.5),
              color: SIDEBAR.accent,
              fontWeight: 500,
              textAlign: "center",
              marginTop: 3,
              lineHeight: 1.35,
            }}
          >
            {t(info.title)}
          </div>
        )}
        {contactRows.length > 0 && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: `1px solid ${SIDEBAR.divider}`,
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              columnGap: 8,
              rowGap: 4,
              fontSize: ts.fs(10.5),
              lineHeight: 1.45,
              ...NUMERIC,
            }}
          >
            {contactRows.map((row, idx) => (
              <div key={idx} style={{ display: "contents" }}>
                <span style={{ color: SIDEBAR.muted, fontWeight: 500 }}>{row.label}</span>
                <span style={{ color: SIDEBAR.body, wordBreak: "break-all" }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}
        {summary && (
          <div style={{ marginTop: 14 }}>
            {renderSidebarHeading(sectionLabel("summary", language))}
            <div style={{ fontSize: ts.fs(10.5), color: SIDEBAR.body, lineHeight: 1.5 }}>
              {emphasizeMetrics(summary, { color: SIDEBAR.text, fontWeight: 600 })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSidebarSkills = () => {
    if (data.skills.length === 0) return null;
    return (
      <div>
        {renderSidebarHeading(sectionLabel("skills", language))}
        <div style={{ display: "flex", flexDirection: "column", gap: ts.sp(9.6) }}>
          {data.skills.map((cat) => (
            <div key={cat.id}>
              <div style={{ fontSize: ts.fs(11), fontWeight: 600, color: SIDEBAR.text, marginBottom: ts.fs(3.6), lineHeight: 1.3 }}>
                {t(cat.category)}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", columnGap: 4, rowGap: ts.fs(4.8) }}>
                {cat.items.map((item, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: ts.fs(10),
                      lineHeight: 1.35,
                      padding: "1.5px 6px",
                      borderRadius: 3,
                      background: SIDEBAR.pillBg,
                      color: SIDEBAR.body,
                    }}
                  >
                    {emphasizeMetrics(item, { color: SIDEBAR.text, fontWeight: 600 })}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHonors = (first: boolean) => {
    if (data.honors.length === 0) return null;
    return (
      <div>
        {renderMainSectionHeader("honors", first)}
        <HonorsGrid
          honors={data.honors}
          lang={language}
          fontScale={fontScale}
          accentColor={accentColor}
          lineHeight={LEADING.body}
          columnGap={20}
          twoColumnMaxEm={22}
        />
      </div>
    );
  };

  const renderMainSectionHeader = (sectionKey: SectionKey, first: boolean) => (
    <div
      style={{
        marginTop: first ? 0 : SPACE.section,
        marginBottom: SPACE.headToBody,
        paddingBottom: 3,
        borderBottom: `1.5px solid ${ACCENT}`,
        fontSize: ts.section,
        fontWeight: 700,
        color: INK.strong,
        letterSpacing: headingTracking(language),
        textTransform: language === "en" ? "uppercase" : undefined,
        lineHeight: 1.25,
      }}
    >
      {sectionLabel(sectionKey, language)}
    </div>
  );

  const description = (text: string) =>
    text ? <div style={{ ...bodyText, marginTop: SPACE.line }}>{emphasizeMetrics(text)}</div> : null;

  const bullets = (items: { zh: string; en: string }[] | undefined) => (
    <Bullets
      items={(items ?? []).map(t)}
      markerColor={palette.marker}
      fontScale={fontScale}
      style={{ ...bodyText, marginTop: SPACE.line * 1.1 }}
    />
  );

  const renderEducation = (first: boolean) => {
    if (data.education.length === 0) return null;
    return (
      <div>
        {renderMainSectionHeader("education", first)}
        {data.education.map((edu, idx) => {
          const meta = educationMeta(edu, { color: ACCENT });
          return (
            <div key={edu.id} style={entryStyle(idx === data.education.length - 1)}>
              <EntryHeader
                title={t(edu.school)}
                titleSuffix={<SchoolTierTag value={edu.schoolTier} fontScale={fontScale} />}
                subtitle={[t(edu.major), t(edu.degree)].filter(Boolean).join(" · ")}
                date={edu.period}
                fontScale={fontScale}
              />
              {meta.length > 0 && (
                <div style={{ fontSize: ts.fs(10.2), color: INK.body, lineHeight: LEADING.meta, marginTop: SPACE.line }}>
                  <InlineList items={meta} separator="|" separatorColor={INK.rule} gap={6} />
                </div>
              )}
              {description(t(edu.description))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderResearchExperience = (first: boolean) => {
    if (!data.researchExperience || data.researchExperience.length === 0) return null;
    return (
      <div>
        {renderMainSectionHeader("researchExperience", first)}
        {data.researchExperience.map((item, idx) => {
          const title = t(item.project) || t(item.institution);
          const institution = t(item.project) ? t(item.institution) : "";
          return (
            <div key={item.id} style={entryStyle(idx === data.researchExperience.length - 1)}>
              <EntryHeader title={title} subtitle={t(item.role)} date={item.period} fontScale={fontScale} />
              {institution && <div style={metaText}>{institution}</div>}
              {description(t(item.description))}
              {bullets(item.highlights)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderExperience = (first: boolean) => {
    if (data.experience.length === 0) return null;
    return (
      <div>
        {renderMainSectionHeader("experience", first)}
        {data.experience.map((exp, idx) => (
          <div key={exp.id} style={entryStyle(idx === data.experience.length - 1)}>
            <EntryHeader title={t(exp.company)} subtitle={t(exp.role)} date={exp.period} fontScale={fontScale} />
            {description(t(exp.description))}
            {bullets(exp.highlights)}
          </div>
        ))}
      </div>
    );
  };

  const renderProjects = (first: boolean) => {
    if (data.projects.length === 0) return null;
    return (
      <div>
        {renderMainSectionHeader("projects", first)}
        {data.projects.map((proj, idx) => {
          const meta = projectMeta(proj);
          return (
            <div key={proj.id} style={entryStyle(idx === data.projects.length - 1)}>
              <EntryHeader title={t(proj.name)} subtitle={t(proj.role)} date={proj.period} fontScale={fontScale} />
              {meta.length > 0 && (
                <div style={metaText}>
                  <InlineList items={meta} separator="|" separatorColor={INK.rule} gap={7} />
                </div>
              )}
              {description(t(proj.description))}
              {bullets(proj.highlights)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCampusActivities = (first: boolean) => {
    if (data.campusActivities.length === 0) return null;
    return (
      <div>
        {renderMainSectionHeader("campusActivities", first)}
        {data.campusActivities.map((act, idx) => (
          <div key={act.id} style={entryStyle(idx === data.campusActivities.length - 1)}>
            <EntryHeader title={t(act.organization)} subtitle={t(act.role)} date={act.period} fontScale={fontScale} />
            {description(t(act.description))}
            {bullets(act.highlights)}
          </div>
        ))}
      </div>
    );
  };

  const sidebarSectionKeys: SectionKey[] = ["skills"];
  const mainSectionKeys: SectionKey[] = [
    "education",
    "researchExperience",
    "honors",
    "experience",
    "projects",
    "campusActivities",
  ];

  const sidebarRenderers: Record<string, () => React.ReactNode> = {
    personalInfo: renderSidebarPersonalInfo,
    skills: renderSidebarSkills,
  };

  const mainRenderers: Record<string, (first: boolean) => React.ReactNode> = {
    education: renderEducation,
    researchExperience: renderResearchExperience,
    honors: renderHonors,
    experience: renderExperience,
    projects: renderProjects,
    campusActivities: renderCampusActivities,
  };

  const visibleSidebarSections: SectionKey[] = [
    "personalInfo",
    ...normalizedSectionOrder.filter(
      (key) => sidebarSectionKeys.includes(key) && emphasis[key] !== "hidden"
    ),
  ];

  const visibleMainSections = normalizedSectionOrder.filter(
    (key) => mainSectionKeys.includes(key) && emphasis[key] !== "hidden"
  );

  return (
    <div
      style={{
        ...RESUME_TEMPLATE_ROOT_STYLE,
        minHeight: `${RESUME_TOKENS.page.minHeightPx}px`,
        fontFamily: FONT_FAMILY,
        lineHeight: LEADING.body,
        display: "flex",
        color: INK.strong,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "28%",
          flex: "0 0 28%",
          boxSizing: "border-box",
          background: SIDEBAR.bg,
          color: SIDEBAR.text,
          padding: "26px 18px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {visibleSidebarSections.map((key) => (
          <div key={key}>{sidebarRenderers[key]?.()}</div>
        ))}
      </div>
      <div
        style={{
          width: "72%",
          flex: "0 0 72%",
          boxSizing: "border-box",
          padding: `${MAIN_PAD.top}px ${MAIN_PAD.right}px ${MAIN_PAD.bottom}px ${MAIN_PAD.left}px`,
        }}
      >
        {visibleMainSections.map((key, idx) => (
          <div key={key}>{mainRenderers[key]?.(idx === 0)}</div>
        ))}
      </div>
    </div>
  );
}
