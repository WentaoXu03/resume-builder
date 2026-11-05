"use client";

import type { AccentColor, BilingualText, ResumeData, SectionKey, SectionEmphasis } from "@/types";
import { RESUME_TEMPLATE_ROOT_STYLE } from "@/lib/templates/designTokens";
import { normalizeSectionOrder } from "@/lib/resume/sectionOrder";
import {
  Bullets,
  EntryHeader,
  FONT_FAMILY,
  HonorsGrid,
  INK,
  InlineList,
  NUMERIC,
  PhotoSlot,
  SchoolTierTag,
  SkillsGrid,
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
 * Compact — high-density single-column layout for information-rich resumes.
 *
 * Uses a restrained vertical bar paired with an inline hairline rule to
 * separate sections cleanly without background banners or vertical waste, pairs 2-column
 * grids for Honors and Skills, and merges project tech + link metadata onto a single line.
 *
 * Photo slot: compact 1-inch ID photo converted to A4 (80×110px).
 */
const PAGE = { top: 22, right: 30, bottom: 20, left: 30 };
const PHOTO = { width: 96, height: 132 };
const BASE_SPACE = { section: 7, headToBody: 4, entry: 6, line: 3 };
const COMPACT_LEADING = 1.42;

export function CompactTemplate({ data, sectionOrder, emphasis, language, fontScale = 1, accentColor }: TemplateProps) {
  const t = (b: Parameters<typeof pickText>[0]) => pickText(b, language);
  const ts = createTypeScale(fontScale);
  const palette = resolveAccentPalette(accentColor);
  const SPACE = {
    section: ts.sp(BASE_SPACE.section),
    headToBody: ts.sp(BASE_SPACE.headToBody),
    entry: ts.sp(BASE_SPACE.entry),
    line: ts.fs(BASE_SPACE.line),
  };

  const normalizedSectionOrder = normalizeSectionOrder(sectionOrder);
  const visibleSections = normalizedSectionOrder.filter(
    (key) => key === "personalInfo" || emphasis[key] !== "hidden"
  );

  const bodyText = { fontSize: ts.fs(10.8), color: INK.body, lineHeight: COMPACT_LEADING } as const;
  const metaText = { fontSize: ts.fs(9.8), color: INK.meta, lineHeight: COMPACT_LEADING } as const;
  const entryStyle = (last: boolean) => ({ marginBottom: last ? 0 : SPACE.entry });

  const renderSectionHeader = (sectionKey: SectionKey) => (
    <div
      style={{
        borderLeft: `3px solid ${palette.accent}`,
        borderBottom: `1px solid ${palette.rule}`,
        background: palette.bandBg,
        padding: "2px 8px",
        marginTop: SPACE.section,
        marginBottom: SPACE.headToBody,
        fontSize: ts.fs(12),
        fontWeight: 700,
        color: palette.accent,
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

  const bullets = (items: BilingualText[] | undefined) => (
    <Bullets
      items={(items ?? []).map(t)}
      markerColor={palette.marker}
      indent={10}
      fontScale={fontScale}
      style={{ ...bodyText, marginTop: SPACE.line * 1.1 }}
    />
  );

  const renderPersonalInfo = () => {
    const info = data.personalInfo;
    const name = t(info.name);
    if (!name && !info.email) return null;

    const title = t(info.title);
    const contactParts = [
      info.gender,
      info.birthDate,
      info.politicalStatus,
      info.phone,
      info.email,
      t(info.location),
      info.website ? displayUrl(info.website) : "",
    ].filter(Boolean);
    const summary = t(info.summary);

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          paddingBottom: 6,
          borderBottom: `1px solid ${INK.hairline}`,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: ts.fs(22),
                fontWeight: 700,
                color: INK.strong,
                lineHeight: 1.2,
                letterSpacing: language === "zh" ? "0.06em" : "0.01em",
              }}
            >
              {name}
            </span>
            {title && (
              <span style={{ fontSize: ts.fs(12), fontWeight: 500, color: palette.subtitle }}>
                {title}
              </span>
            )}
          </div>
          {contactParts.length > 0 && (
            <div style={{ fontSize: ts.fs(10.5), color: INK.body, marginTop: 3, lineHeight: COMPACT_LEADING, ...NUMERIC }}>
              <InlineList items={contactParts} separator="|" separatorColor={INK.rule} gap={6} />
            </div>
          )}
          {summary && (
            <div style={{ fontSize: ts.fs(10.5), color: INK.meta, marginTop: 3, lineHeight: COMPACT_LEADING }}>
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
    return (
      <div>
        {renderSectionHeader("education")}
        {data.education.map((edu, idx) => {
          const meta = educationMeta(edu);
          return (
            <div key={edu.id} style={entryStyle(idx === data.education.length - 1)}>
              <EntryHeader
                title={t(edu.school)}
                titleSuffix={<SchoolTierTag value={edu.schoolTier} fontScale={fontScale} />}
                subtitle={[t(edu.major), t(edu.degree)].filter(Boolean).join(" · ")}
                date={edu.period}
                fontScale={fontScale}
                titleStyle={{ fontSize: ts.fs(11.5) }}
                subtitleStyle={{ fontSize: ts.fs(11) }}
              />
              {meta.length > 0 && (
                <div style={{ fontSize: ts.fs(10.2), color: INK.body, lineHeight: COMPACT_LEADING, marginTop: SPACE.line }}>
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

  const renderResearchExperience = () => {
    if (!data.researchExperience || data.researchExperience.length === 0) return null;
    return (
      <div>
        {renderSectionHeader("researchExperience")}
        {data.researchExperience.map((item, idx) => {
          const title = t(item.project) || t(item.institution);
          const institution = t(item.project) ? t(item.institution) : "";
          return (
            <div key={item.id} style={entryStyle(idx === data.researchExperience.length - 1)}>
              <EntryHeader
                title={title}
                subtitle={[t(item.role), institution].filter(Boolean).join(" · ")}
                date={item.period}
                fontScale={fontScale}
                titleStyle={{ fontSize: ts.fs(11.5) }}
                subtitleStyle={{ fontSize: ts.fs(11) }}
              />
              {description(t(item.description))}
              {bullets(item.highlights)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderHonors = () => {
    if (data.honors.length === 0) return null;
    return (
      <div>
        {renderSectionHeader("honors")}
        <HonorsGrid
          honors={data.honors}
          lang={language}
          fontSize={10.8}
          fontScale={fontScale}
          accentColor={accentColor}
          lineHeight={COMPACT_LEADING}
          rowGap={1.8}
          columnGap={24}
        />
      </div>
    );
  };

  const renderExperience = () => {
    if (data.experience.length === 0) return null;
    return (
      <div>
        {renderSectionHeader("experience")}
        {data.experience.map((exp, idx) => (
          <div key={exp.id} style={entryStyle(idx === data.experience.length - 1)}>
            <EntryHeader
              title={t(exp.company)}
              subtitle={t(exp.role)}
              date={exp.period}
              fontScale={fontScale}
              titleStyle={{ fontSize: ts.fs(11.5) }}
              subtitleStyle={{ fontSize: ts.fs(11) }}
            />
            {description(t(exp.description))}
            {bullets(exp.highlights)}
          </div>
        ))}
      </div>
    );
  };

  const renderProjects = () => {
    if (data.projects.length === 0) return null;
    return (
      <div>
        {renderSectionHeader("projects")}
        {data.projects.map((proj, idx) => {
          const meta = projectMeta(proj);
          return (
            <div key={proj.id} style={entryStyle(idx === data.projects.length - 1)}>
              <EntryHeader
                title={t(proj.name)}
                subtitle={t(proj.role)}
                date={proj.period}
                fontScale={fontScale}
                titleStyle={{ fontSize: ts.fs(11.5) }}
                subtitleStyle={{ fontSize: ts.fs(11) }}
              />
              {meta.length > 0 && (
                <div style={metaText}>
                  <InlineList items={meta} separator="|" separatorColor={INK.rule} gap={6} />
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

  const renderCampusActivities = () => {
    if (data.campusActivities.length === 0) return null;
    return (
      <div>
        {renderSectionHeader("campusActivities")}
        {data.campusActivities.map((act, idx) => (
          <div key={act.id} style={entryStyle(idx === data.campusActivities.length - 1)}>
            <EntryHeader
              title={t(act.organization)}
              subtitle={t(act.role)}
              date={act.period}
              fontScale={fontScale}
              titleStyle={{ fontSize: ts.fs(11.5) }}
              subtitleStyle={{ fontSize: ts.fs(11) }}
            />
            {description(t(act.description))}
            {bullets(act.highlights)}
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    if (data.skills.length === 0) return null;
    return (
      <div>
        {renderSectionHeader("skills")}
        <SkillsGrid
          skills={data.skills}
          lang={language}
          fontSize={10.5}
          fontScale={fontScale}
          lineHeight={COMPACT_LEADING}
          rowGap={1.8}
          columnGap={20}
          twoColumnMaxEm={31}
        />
      </div>
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
        lineHeight: COMPACT_LEADING,
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
