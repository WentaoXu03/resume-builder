"use client";

import type { AccentColor, ResumeData, SectionKey, SectionEmphasis } from "@/types";
import { RESUME_TEMPLATE_ROOT_STYLE } from "@/lib/templates/designTokens";
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
  SkillsGrid,
  createTypeScale,
  displayUrl,
  educationMeta,
  emphasizeMetrics,
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
 * Minimal — Swiss editorial layout.
 *
 * A clean asymmetric two-track grid: each section is separated by a fine hairline rule,
 * with the section title anchored in a dedicated left gutter and entries aligned on a
 * single reading axis to the right.
 *
 * Photo slot: standard 1-inch ID photo converted to A4 (88×120px).
 */
const PAGE = { top: 28, right: 36, bottom: 26, left: 36 };
const PHOTO = { width: 88, height: 120 };
const BASE_GUTTER_PX = 88;
const BASE_SPACE = { section: 10, entry: 8.4, line: 3 };

export function MinimalTemplate({ data, sectionOrder, emphasis, language, fontScale = 1, accentColor }: TemplateProps) {
  const t = (b: Parameters<typeof pickText>[0]) => pickText(b, language);
  const ts = createTypeScale(fontScale);
  const palette = resolveAccentPalette(accentColor);
  const gutterPx = Math.round(BASE_GUTTER_PX * ts.scale);
  const SPACE = {
    section: ts.sp(BASE_SPACE.section),
    entry: ts.sp(BASE_SPACE.entry),
    line: ts.fs(BASE_SPACE.line),
  };

  const normalizedSectionOrder = normalizeSectionOrder(sectionOrder);
  const visibleSections = normalizedSectionOrder.filter(
    (key) => key === "personalInfo" || emphasis[key] !== "hidden"
  );

  const bodyText = { fontSize: ts.body, color: INK.body, lineHeight: LEADING.body } as const;
  const metaText = { fontSize: ts.meta, color: INK.meta, lineHeight: LEADING.meta } as const;
  const entryStyle = (last: boolean) => ({ marginBottom: last ? 0 : SPACE.entry });

  const sectionRow = (sectionKey: SectionKey, content: React.ReactNode) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${gutterPx}px 1fr`,
        columnGap: 16,
        paddingTop: SPACE.section,
        marginTop: SPACE.section,
        borderTop: `1px solid ${palette.rule}`,
        alignItems: "baseline",
      }}
    >
      <div
        style={{
          fontSize: ts.fs(language === "zh" ? 12 : 10.5),
          fontWeight: 700,
          color: palette.accent,
          letterSpacing: "0.08em",
          textTransform: language === "en" ? "uppercase" : undefined,
          lineHeight: LEADING.title,
        }}
      >
        {sectionLabel(sectionKey, language)}
      </div>
      <div style={{ minWidth: 0 }}>{content}</div>
    </div>
  );

  const description = (text: string) =>
    text ? <div style={{ ...bodyText, marginTop: SPACE.line }}>{emphasizeMetrics(text)}</div> : null;

  const bullets = (items: { zh: string; en: string }[] | undefined) => (
    <Bullets
      items={(items ?? []).map(t)}
      marker="–"
      markerColor={palette.marker}
      indent={12}
      fontScale={fontScale}
      style={{ ...bodyText, marginTop: SPACE.line * 1.1 }}
    />
  );

  const renderPersonalInfo = () => {
    const info = data.personalInfo;
    const name = t(info.name);
    if (!name && !info.email) return null;
    const title = t(info.title);

    const identity = [info.gender, info.birthDate, info.politicalStatus].filter(Boolean).join(" · ");
    const contactItems = [
      identity,
      info.phone,
      info.email,
      t(info.location),
      info.website ? displayUrl(info.website) : "",
    ].filter(Boolean);
    const summary = t(info.summary);

    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: ts.fs(25),
                fontWeight: 700,
                color: INK.strong,
                lineHeight: 1.2,
                letterSpacing: language === "zh" ? "0.06em" : "0.01em",
              }}
            >
              {name}
            </span>
            {title && (
              <span style={{ fontSize: ts.headline, fontWeight: 500, color: INK.meta }}>
                {title}
              </span>
            )}
          </div>
          {contactItems.length > 0 && (
            <div style={{ fontSize: ts.fs(10.5), color: INK.body, marginTop: 5, lineHeight: LEADING.body, ...NUMERIC }}>
              <InlineList items={contactItems} separator="·" separatorColor={INK.faint} gap={6} />
            </div>
          )}
          {summary && (
            <div style={{ ...bodyText, marginTop: 5 }}>
              {emphasizeMetrics(summary)}
            </div>
          )}
        </div>
        <PhotoSlot src={info.avatarUrl} lang={language} width={PHOTO.width} height={PHOTO.height} />
      </div>
    );
  };

  const renderEducation = () => {
    if (data.education.length === 0) return null;
    return sectionRow(
      "education",
      data.education.map((edu, idx) => {
        const meta = educationMeta(edu);
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
                <InlineList items={meta} separator="·" separatorColor={INK.faint} gap={6} />
              </div>
            )}
            {description(t(edu.description))}
          </div>
        );
      })
    );
  };

  const renderResearchExperience = () => {
    if (!data.researchExperience || data.researchExperience.length === 0) return null;
    return sectionRow(
      "researchExperience",
      data.researchExperience.map((item, idx) => {
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
      })
    );
  };

  const renderHonors = () => {
    if (data.honors.length === 0) return null;
    return sectionRow(
      "honors",
      <HonorsGrid
        honors={data.honors}
        lang={language}
        fontScale={fontScale}
        accentColor={accentColor}
        lineHeight={LEADING.body}
        columnGap={24}
        twoColumnMaxEm={23}
      />
    );
  };

  const renderExperience = () => {
    if (data.experience.length === 0) return null;
    return sectionRow(
      "experience",
      data.experience.map((exp, idx) => (
        <div key={exp.id} style={entryStyle(idx === data.experience.length - 1)}>
          <EntryHeader title={t(exp.company)} subtitle={t(exp.role)} date={exp.period} fontScale={fontScale} />
          {description(t(exp.description))}
          {bullets(exp.highlights)}
        </div>
      ))
    );
  };

  const renderProjects = () => {
    if (data.projects.length === 0) return null;
    return sectionRow(
      "projects",
      data.projects.map((proj, idx) => {
        const meta = projectMeta(proj);
        return (
          <div key={proj.id} style={entryStyle(idx === data.projects.length - 1)}>
            <EntryHeader title={t(proj.name)} subtitle={t(proj.role)} date={proj.period} fontScale={fontScale} />
            {meta.length > 0 && (
              <div style={metaText}>
                <InlineList items={meta} separator="·" separatorColor={INK.faint} gap={6} />
              </div>
            )}
            {description(t(proj.description))}
            {bullets(proj.highlights)}
          </div>
        );
      })
    );
  };

  const renderCampusActivities = () => {
    if (data.campusActivities.length === 0) return null;
    return sectionRow(
      "campusActivities",
      data.campusActivities.map((act, idx) => (
        <div key={act.id} style={entryStyle(idx === data.campusActivities.length - 1)}>
          <EntryHeader title={t(act.organization)} subtitle={t(act.role)} date={act.period} fontScale={fontScale} />
          {description(t(act.description))}
          {bullets(act.highlights)}
        </div>
      ))
    );
  };

  const renderSkills = () => {
    if (data.skills.length === 0) return null;
    return sectionRow(
      "skills",
      <SkillsGrid skills={data.skills} lang={language} fontScale={fontScale} lineHeight={LEADING.body} />
    );
  };

  const sectionRenderers: Record<SectionKey, () => React.ReactNode> = {
    personalInfo: renderPersonalInfo,
    education: renderEducation,
    researchExperience: renderResearchExperience,
    honors: renderHonors,
    experience: renderExperience,
    projects: renderProjects,
    campusActivities: renderCampusActivities,
    skills: renderSkills,
  };

  return (
    <div
      style={{
        ...RESUME_TEMPLATE_ROOT_STYLE,
        padding: `${PAGE.top}px ${PAGE.right}px ${PAGE.bottom}px ${PAGE.left}px`,
        fontFamily: FONT_FAMILY,
        lineHeight: LEADING.body,
        color: INK.strong,
        background: "#ffffff",
      }}
    >
      {visibleSections.map((key) => (
        <div key={key}>{sectionRenderers[key]?.()}</div>
      ))}
    </div>
  );
}
