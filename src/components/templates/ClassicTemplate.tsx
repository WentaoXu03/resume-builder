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
 * Classic — traditional single column.
 * The identity block is centered on the true page axis (the 1-inch ID photo is taken out
 * of the flow and mirrored by equal side padding); sections are marked by a bold, tracked
 * title over a dark rule — the rules give the page a steady horizontal rhythm.
 *
 * Photo slot: standard 1-inch ID photo converted to A4 (25×35mm ≈ 90×124px).
 */
const PAGE = { top: 28, right: 36, bottom: 26, left: 36 };
const PHOTO = { width: 108, height: 149 };
const BASE_SPACE = { section: 9, headToBody: 4, entry: 7.2, line: 3 };

export function ClassicTemplate({ data, sectionOrder, emphasis, language, fontScale = 1, accentColor }: TemplateProps) {
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
  const info = data.personalInfo;
  const name = t(info.name);

  const bodyText = { fontSize: ts.body, color: INK.body, lineHeight: LEADING.body } as const;
  const metaText = { fontSize: ts.meta, color: INK.meta, lineHeight: LEADING.meta } as const;
  const entryStyle = (last: boolean) => ({ marginBottom: last ? 0 : SPACE.entry });

  const sectionHead = (sectionKey: SectionKey) => (
    <div
      style={{
        marginTop: SPACE.section,
        marginBottom: SPACE.headToBody,
        paddingBottom: 2,
        borderBottom: `1.25px solid ${palette.accent}`,
        fontSize: ts.section,
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

  const bullets = (items: { zh: string; en: string }[] | undefined) => (
    <Bullets
      items={(items ?? []).map(t)}
      markerColor={palette.marker}
      fontScale={fontScale}
      style={{ ...bodyText, marginTop: SPACE.line * 1.1 }}
    />
  );

  const renderPersonalInfo = () => {
    if (!name && !info.email) return null;
    const identity = [info.gender, info.birthDate, info.politicalStatus].filter(Boolean);
    const contacts = [info.phone, info.email, t(info.location), info.website ? displayUrl(info.website) : ""].filter(Boolean);
    const summary = t(info.summary);
    const sidePad = PHOTO.width + 14;
    const rowStyle = { fontSize: ts.fs(10.5), color: INK.body, lineHeight: LEADING.body, ...NUMERIC } as const;
    return (
      <div
        style={{
          position: "relative",
          minHeight: PHOTO.height,
          padding: `0 ${sidePad}px`,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: ts.name,
            fontWeight: 700,
            color: INK.strong,
            lineHeight: 1.2,
            letterSpacing: language === "zh" ? "0.16em" : "0.02em",
            // compensate trailing tracking so CJK names stay optically centered
            marginRight: language === "zh" ? "-0.16em" : 0,
          }}
        >
          {name}
        </div>
        {t(info.title) && (
          <div style={{ fontSize: ts.headline, color: INK.body, marginTop: 2, lineHeight: 1.35 }}>{t(info.title)}</div>
        )}
        {identity.length > 0 && (
          <div style={{ ...rowStyle, marginTop: 4 }}>
            <InlineList items={identity} separator="|" separatorColor={INK.rule} gap={7} />
          </div>
        )}
        {contacts.length > 0 && (
          <div style={{ ...rowStyle, marginTop: identity.length > 0 ? 1 : 4 }}>
            <InlineList items={contacts} separator="|" separatorColor={INK.rule} gap={7} />
          </div>
        )}
        {summary && (
          <div style={{ fontSize: ts.fs(10.5), color: INK.meta, lineHeight: 1.45, marginTop: 4 }}>
            {emphasizeMetrics(summary)}
          </div>
        )}
        <div style={{ position: "absolute", top: 0, right: 0 }}>
          <PhotoSlot src={info.avatarUrl} lang={language} width={PHOTO.width} height={PHOTO.height} />
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (data.education.length === 0) return null;
    return (
      <div>
        {sectionHead("education")}
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
              />
              {meta.length > 0 && (
                <div style={{ ...bodyText, marginTop: SPACE.line }}>
                  <InlineList items={meta} separator="|" separatorColor={INK.rule} gap={7} />
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
        {sectionHead("researchExperience")}
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

  const renderHonors = () => {
    if (data.honors.length === 0) return null;
    return (
      <div>
        {sectionHead("honors")}
        <HonorsGrid honors={data.honors} lang={language} fontScale={fontScale} accentColor={accentColor} lineHeight={LEADING.body} />
      </div>
    );
  };

  const renderExperience = () => {
    if (data.experience.length === 0) return null;
    return (
      <div>
        {sectionHead("experience")}
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

  const renderProjects = () => {
    if (!data.projects || data.projects.length === 0) return null;
    return (
      <div>
        {sectionHead("projects")}
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

  const renderCampusActivities = () => {
    if (data.campusActivities.length === 0) return null;
    return (
      <div>
        {sectionHead("campusActivities")}
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

  const renderSkills = () => {
    if (data.skills.length === 0) return null;
    return (
      <div>
        {sectionHead("skills")}
        <SkillsGrid
          skills={data.skills}
          lang={language}
          fontSize={10.2}
          fontScale={fontScale}
          lineHeight={LEADING.body}
          columnGap={18}
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
        lineHeight: 1.5,
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
