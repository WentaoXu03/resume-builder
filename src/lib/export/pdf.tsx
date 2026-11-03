"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import type { Education, ResumeData, SectionKey, SectionEmphasis, TemplateName } from "@/types";
import { normalizeSchoolTier } from "@/types";
import { RESUME_TOKENS } from "@/lib/templates/designTokens";

Font.register({
  family: "Noto",
  fonts: [
    { src: "/NotoSansSC-Regular.ttf", fontWeight: 400 },
    { src: "/NotoSansSC-Bold.ttf", fontWeight: 700 },
  ],
});

interface PDFProps {
  data: ResumeData;
  sectionOrder: SectionKey[];
  emphasis: Partial<Record<SectionKey, SectionEmphasis>>;
  language: "zh" | "en";
  template: TemplateName;
}

function getText(b: { zh: string; en: string } | undefined | null, lang: "zh" | "en"): string {
  if (!b) return "";
  const raw = lang === "zh" ? b.zh || b.en : b.en || b.zh;
  return raw.replace(/\*\*([^*\n]+?)\*\*/g, "$1");
}

function schoolTierText(edu: Education, language: "zh" | "en", color: string, fontSize = 9) {
  const tier = normalizeSchoolTier(edu.schoolTier);
  if (!tier || !getText(edu.school, language)) return null;
  return <Text style={{ fontSize, fontWeight: 600, color }}>{` ${tier}`}</Text>;
}

const SECTION_LABELS: Record<SectionKey, { zh: string; en: string }> = {
  personalInfo: { zh: "基本信息", en: "Personal Info" },
  education: { zh: "教育背景", en: "Education" },
  researchExperience: { zh: "科研经历", en: "Research Experience" },
  honors: { zh: "荣誉奖项", en: "Honors & Awards" },
  experience: { zh: "实习经历", en: "Internship" },
  projects: { zh: "项目经历", en: "Projects" },
  campusActivities: { zh: "活动经历", en: "Activities" },
  skills: { zh: "技能特长", en: "Skills" },
};

function label(key: SectionKey, lang: "zh" | "en") {
  return lang === "zh" ? SECTION_LABELS[key].zh : SECTION_LABELS[key].en;
}

const TOKENS = RESUME_TOKENS;
const C = RESUME_TOKENS.colors;

export function createResumePDF({ data, sectionOrder, emphasis, language, template }: PDFProps) {
  const visibleSections = sectionOrder.filter(
    (key) => key === "personalInfo" || emphasis[key] !== "hidden"
  );

  switch (template) {
    case "modern":
      return createModernPDF(data, visibleSections, emphasis, language);
    case "minimal":
      return createMinimalPDF(data, visibleSections, emphasis, language);
    case "compact":
      return createCompactPDF(data, visibleSections, emphasis, language);
    default:
      return createClassicPDF(data, visibleSections, emphasis, language);
  }
}

function createClassicPDF(data: ResumeData, sections: SectionKey[], emphasis: Partial<Record<SectionKey, SectionEmphasis>>, language: "zh" | "en") {
  const padding = TOKENS.page.padding.classic;
  const s = StyleSheet.create({
    page: { paddingTop: padding.top, paddingRight: padding.right, paddingBottom: padding.bottom, paddingLeft: padding.left, fontFamily: "Noto", fontSize: TOKENS.fontSize.body, color: C.text, lineHeight: 1.5 },
    name: { fontSize: TOKENS.fontSize.name, fontWeight: 700, textAlign: "center", marginBottom: 2 },
    title: { fontSize: TOKENS.fontSize.sectionTitle, color: C.textSecondary, textAlign: "center", marginBottom: 2 },
    contacts: { flexDirection: "row", justifyContent: "center", gap: 10, fontSize: TOKENS.fontSize.body, color: C.textSecondary, marginTop: 4, flexWrap: "wrap" },
    summary: { fontSize: TOKENS.fontSize.body, color: C.textSecondary, lineHeight: 1.5 },
    sectionHead: { fontSize: TOKENS.fontSize.sectionTitle, fontWeight: 700, color: C.text, marginTop: TOKENS.spacing.sectionTop, marginBottom: TOKENS.spacing.sectionTitleBottom, paddingBottom: 3, borderBottomWidth: TOKENS.line.sectionStrongPx, borderBottomColor: C.lineStrong },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    bold: { fontWeight: 700, fontSize: TOKENS.fontSize.itemTitle },
    secondary: { fontSize: TOKENS.fontSize.body, color: C.textSecondary },
    muted: { fontSize: TOKENS.fontSize.body, color: C.textMuted },
    mutedSmall: { fontSize: TOKENS.fontSize.meta, color: C.textMuted },
    body11: { fontSize: TOKENS.fontSize.body, color: C.textSecondary, lineHeight: 1.5 },
    bullet: { flexDirection: "row", marginLeft: 14, marginBottom: 0 },
    bulletDot: { width: 10, fontSize: TOKENS.fontSize.body, color: C.textSecondary },
    bulletText: { flex: 1, fontSize: TOKENS.fontSize.body, color: C.textSecondary, lineHeight: 1.5 },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 3, marginTop: 2 },
    tag: { fontSize: TOKENS.fontSize.tag, paddingHorizontal: 4, paddingVertical: 0, borderRadius: TOKENS.radius.tag, backgroundColor: "#f5f5f5", color: C.textSecondary, borderWidth: TOKENS.line.itemPx, borderColor: C.lineSubtle },
    link: { fontSize: 10, color: C.textMuted, marginTop: 1 },
    skillCat: { fontWeight: 700, fontSize: TOKENS.fontSize.body },
    divider: { height: TOKENS.line.itemPx, backgroundColor: C.line, marginTop: 4 },
  });

  const info = data.personalInfo;
  const name = getText(info.name, language);

  const renderPersonalInfo = () => {
    if (!name && !info.email) return null;
    return (
      <View style={{ marginBottom: 6, paddingBottom: 8, borderBottomWidth: TOKENS.line.sectionNormalPx, borderBottomColor: C.line }}>
        {name ? <Text style={s.name}>{name}</Text> : null}
        {getText(info.title, language) ? <Text style={s.title}>{getText(info.title, language)}</Text> : null}
        <View style={s.contacts}>
          {[info.gender, info.birthDate, info.politicalStatus, info.phone, info.email, getText(info.location, language), info.website].filter(Boolean).map((t, i) => <Text key={i}>{t}</Text>)}
        </View>
        {getText(info.summary, language) ? <Text style={s.summary}>{getText(info.summary, language)}</Text> : null}
      </View>
    );
  };

  const renderEducation = () => {
    if ((data.education?.length ?? 0) === 0) return null;
    return (
      <View>
        <Text style={s.sectionHead}>{label("education", language)}</Text>
        {data.education.map((edu) => (
          <View key={edu.id} style={{ marginBottom: 6 }}>
            <View style={s.row}>
              <Text><Text style={s.bold}>{getText(edu.school, language)}</Text>{schoolTierText(edu, language, C.textMuted)}{getText(edu.major, language) ? <Text style={s.secondary}> · {getText(edu.major, language)}</Text> : null}{getText(edu.degree, language) ? <Text style={s.secondary}> · {getText(edu.degree, language)}</Text> : null}</Text>
              {edu.period ? <Text style={s.muted}>{edu.period}</Text> : null}
            </View>
            {edu.gpa ? (
              <Text style={s.secondary}>GPA: {edu.gpa}</Text>
            ) : null}
            {getText(edu.description, language) ? <Text style={s.body11}>{getText(edu.description, language)}</Text> : null}
          </View>
        ))}
      </View>
    );
  };

  const renderHonors = () => {
    if ((data.honors?.length ?? 0) === 0) return null;
    return (
      <View>
        <Text style={s.sectionHead}>{label("honors", language)}</Text>
        {data.honors.map((h) => (
          <View key={h.id} style={{ marginBottom: 3 }}>
            <View style={s.row}>
              <Text><Text style={{ fontWeight: 600, fontSize: 11 }}>{getText(h.title, language)}</Text>{h.level ? <Text style={s.mutedSmall}> [{h.level}]</Text> : null}</Text>
              {h.period ? <Text style={s.muted}>{h.period}</Text> : null}
            </View>
            {getText(h.description, language) ? <Text style={s.body11}>{getText(h.description, language)}</Text> : null}
          </View>
        ))}
      </View>
    );
  };

  const renderExperience = () => {
    if ((data.experience?.length ?? 0) === 0) return null;
    return (
      <View>
        <Text style={s.sectionHead}>{label("experience", language)}</Text>
        {data.experience.map((exp) => (
          <View key={exp.id} style={{ marginBottom: 6 }}>
            <View style={s.row}>
              <Text><Text style={s.bold}>{getText(exp.company, language)}</Text><Text style={{ fontSize: 12, fontWeight: 400 }}> · {getText(exp.role, language)}</Text></Text>
              {exp.period ? <Text style={s.muted}>{exp.period}</Text> : null}
            </View>
            {getText(exp.description, language) ? <Text style={s.body11}>{getText(exp.description, language)}</Text> : null}
            {(exp.highlights?.length ?? 0) > 0 ? exp.highlights.map((h, i) => (
              <View key={i} style={s.bullet}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{getText(h, language)}</Text>
              </View>
            )) : null}
          </View>
        ))}
      </View>
    );
  };

  const renderProjects = () => {
    if ((data.projects?.length ?? 0) === 0) return null;
    return (
      <View>
        <Text style={s.sectionHead}>{label("projects", language)}</Text>
        {data.projects.map((proj) => (
          <View key={proj.id} style={{ marginBottom: 6 }}>
            <View style={s.row}>
              <Text><Text style={s.bold}>{getText(proj.name, language)}</Text>{getText(proj.role, language) ? <Text style={s.secondary}> · {getText(proj.role, language)}</Text> : null}</Text>
              {proj.period ? <Text style={s.muted}>{proj.period}</Text> : null}
            </View>
            {proj.link ? <Text style={s.link}>{proj.link}</Text> : null}
            {(proj.tech?.length ?? 0) > 0 ? (
              <View style={s.tagRow}>
                {proj.tech.map((t, i) => <Text key={i} style={s.tag}>{t}</Text>)}
              </View>
            ) : null}
            {getText(proj.description, language) ? <Text style={s.body11}>{getText(proj.description, language)}</Text> : null}
          </View>
        ))}
      </View>
    );
  };

  const renderCampusActivities = () => {
    if ((data.campusActivities?.length ?? 0) === 0) return null;
    return (
      <View>
        <Text style={s.sectionHead}>{label("campusActivities", language)}</Text>
        {data.campusActivities.map((act) => (
          <View key={act.id} style={{ marginBottom: 5 }}>
            <View style={s.row}>
              <Text><Text style={s.bold}>{getText(act.organization, language)}</Text><Text style={{ fontSize: 12, fontWeight: 400 }}> · {getText(act.role, language)}</Text></Text>
              {act.period ? <Text style={s.muted}>{act.period}</Text> : null}
            </View>
            {getText(act.description, language) ? <Text style={s.body11}>{getText(act.description, language)}</Text> : null}
            {(act.highlights?.length ?? 0) > 0 ? act.highlights.map((h, i) => (
              <View key={i} style={s.bullet}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{getText(h, language)}</Text>
              </View>
            )) : null}
          </View>
        ))}
      </View>
    );
  };

  const renderSkills = () => {
    if ((data.skills?.length ?? 0) === 0) return null;
    return (
      <View>
        <Text style={s.sectionHead}>{label("skills", language)}</Text>
        {data.skills.map((cat) => (
          <View key={cat.id} style={{ marginBottom: 3 }}>
            <Text><Text style={s.skillCat}>{getText(cat.category, language)}：</Text><Text style={s.secondary}>{(cat.items ?? []).join(" | ")}</Text></Text>
          </View>
        ))}
      </View>
    );
  };

  const renderers: Record<SectionKey, () => React.ReactNode> = {
    personalInfo: renderPersonalInfo, education: renderEducation, researchExperience: () => null, honors: renderHonors,
    experience: renderExperience, projects: renderProjects, campusActivities: renderCampusActivities, skills: renderSkills,
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {sections.map((key) => <View key={key}>{renderers[key]?.()}</View>)}
      </Page>
    </Document>
  );
}

function createModernPDF(data: ResumeData, sections: SectionKey[], emphasis: Partial<Record<SectionKey, SectionEmphasis>>, language: "zh" | "en") {
  const padding = TOKENS.page.padding.modern;
  const s = StyleSheet.create({
    page: { fontFamily: "Noto", fontSize: TOKENS.fontSize.meta, color: C.text, lineHeight: 1.5 },
    row: { flexDirection: "row" },
    sidebar: { width: "30%", backgroundColor: C.modernSidebar, padding: "24px 16px" },
    sidebarText: { color: C.modernSidebarText },
    sidebarMuted: { color: C.modernSidebarMuted },
    main: { width: "70%", paddingTop: padding.top, paddingRight: padding.right, paddingBottom: padding.bottom, paddingLeft: padding.left },
    sidebarName: { fontSize: 20, fontWeight: 700, color: C.modernSidebarText, textAlign: "center", lineHeight: 1.3 },
    sidebarTitle: { fontSize: TOKENS.fontSize.body, color: C.modernSidebarMuted, textAlign: "center", marginTop: 3 },
    sidebarDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginTop: 10, marginBottom: 10 },
    sidebarContact: { fontSize: 10, color: C.modernSidebarMuted, lineHeight: 1.8 },
    sidebarHeading: { fontSize: TOKENS.fontSize.sectionTitle, fontWeight: 700, color: C.modernSidebarText, paddingBottom: 3, marginBottom: TOKENS.spacing.sectionTitleBottom, borderBottomWidth: TOKENS.line.sectionStrongPx, borderBottomColor: C.accentBlue },
    sidebarCat: { fontSize: 10, fontWeight: 700, color: C.modernSidebarMuted, marginBottom: 3 },
    sidebarItems: { fontSize: 10, color: C.modernSidebarText, lineHeight: 1.6, marginBottom: 8 },
    mainHeading: { fontSize: TOKENS.fontSize.sectionTitle, fontWeight: 700, color: C.text, marginBottom: TOKENS.spacing.sectionTitleBottom, paddingBottom: 3, borderBottomWidth: TOKENS.line.sectionStrongPx, borderBottomColor: C.accentBlue },
    mainBold: { fontWeight: 700, fontSize: TOKENS.fontSize.body, color: C.text },
    mainSecondary: { fontSize: TOKENS.fontSize.body, color: C.textSecondary },
    mainMuted: { fontSize: 10, color: C.textMuted },
    mainBody: { fontSize: TOKENS.fontSize.meta, color: C.textSecondary, lineHeight: 1.6 },
    link: { fontSize: 10, color: C.textMuted, marginTop: 1 },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 3 },
    tag: { fontSize: 9, paddingHorizontal: 6, paddingVertical: 1, borderRadius: TOKENS.radius.tag, backgroundColor: "#eaf2f8", color: C.accentBlue },
    itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    bullet: { flexDirection: "row", marginLeft: 14, marginBottom: 0 },
    bulletDot: { width: 10, fontSize: TOKENS.fontSize.meta, color: C.textSecondary },
    bulletText: { flex: 1, fontSize: TOKENS.fontSize.meta, color: C.textSecondary, lineHeight: 1.6 },
    itemDivider: { height: TOKENS.line.itemPx, backgroundColor: C.lineSubtle, marginTop: 8, marginBottom: 8 },
    honorBadge: { fontSize: 9, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 3, fontWeight: 700 },
  });

  const info = data.personalInfo;
  const name = getText(info.name, language);
  const HONOR_COLORS: Record<string, { bg: string; color: string }> = {
    national: { bg: "#c0392b", color: "#ffffff" },
    "国家级": { bg: "#c0392b", color: "#ffffff" },
    provincial: { bg: "#e67e22", color: "#ffffff" },
    "省级": { bg: "#e67e22", color: "#ffffff" },
    university: { bg: "#2980b9", color: "#ffffff" },
    "校级": { bg: "#2980b9", color: "#ffffff" },
  };

  const renderSidebar = () => (
    <View style={s.sidebar}>
      {info.avatarUrl ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image src={info.avatarUrl} style={{ width: 72, height: 72, borderRadius: 36, marginBottom: 10, alignSelf: "center" }} />
      ) : name ? (
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 10, alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 28, color: C.modernSidebarMuted, fontWeight: 300 }}>{name.charAt(0)}</Text>
        </View>
      ) : null}
      {name ? <Text style={s.sidebarName}>{name}</Text> : null}
      {getText(info.title, language) ? <Text style={s.sidebarTitle}>{getText(info.title, language)}</Text> : null}
      <View style={s.sidebarDivider} />
      <View style={s.sidebarContact}>
        {[info.gender, info.birthDate, info.politicalStatus].filter(Boolean).join(" · ") ? <Text>{[info.gender, info.birthDate, info.politicalStatus].filter(Boolean).join(" · ")}</Text> : null}
        {info.phone ? <Text>📱 {info.phone}</Text> : null}
        {info.email ? <Text>✉ {info.email}</Text> : null}
        {getText(info.location, language) ? <Text>📍 {getText(info.location, language)}</Text> : null}
        {info.website ? <Text>🔗 {info.website}</Text> : null}
      </View>

      {emphasis.skills !== "hidden" && (data.skills?.length ?? 0) > 0 ? (
        <View style={{ marginTop: 16 }}>
          <Text style={s.sidebarHeading}>{label("skills", language)}</Text>
          {data.skills.map((cat) => (
            <View key={cat.id} style={{ marginBottom: 8 }}>
              <Text style={s.sidebarCat}>{getText(cat.category, language)}</Text>
              <Text style={s.sidebarItems}>{(cat.items ?? []).join(" · ")}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );

  const mainSectionKeys = ["education", "honors", "experience", "projects", "campusActivities"] as SectionKey[];
  const visibleMainSections = sections.filter(k => mainSectionKeys.includes(k));

  const renderMain = () => (
    <View style={s.main}>
      {visibleMainSections.map((key) => {
        switch (key) {
          case "education":
            return (data.education?.length ?? 0) === 0 ? null : (
              <View key="education" style={{ marginBottom: 12 }}>
                <Text style={s.mainHeading}>{label("education", language)}</Text>
                {data.education.map((edu) => (
                  <View key={edu.id} style={{ marginBottom: 8 }}>
                    <View style={s.itemRow}>
                      <Text><Text style={s.mainBold}>{getText(edu.school, language)}</Text>{schoolTierText(edu, language, C.textMuted)}<Text style={s.mainBold}>{[getText(edu.degree, language), getText(edu.major, language)].filter(Boolean).map((part, index) => `${getText(edu.school, language) || index > 0 ? " · " : ""}${part}`).join("")}</Text>{edu.gpa ? <Text style={{ fontSize: 10, fontWeight: 700, color: C.accentBlue, marginLeft: 8 }}> GPA: {edu.gpa}</Text> : null}</Text>
                      {edu.period ? <Text style={s.mainMuted}>{edu.period}</Text> : null}
                    </View>
                    {getText(edu.description, language) ? <Text style={s.mainBody}>{getText(edu.description, language)}</Text> : null}
                  </View>
                ))}
              </View>
            );
          case "honors":
            return (data.honors?.length ?? 0) === 0 ? null : (
              <View key="honors" style={{ marginBottom: 12 }}>
                <Text style={s.mainHeading}>{label("honors", language)}</Text>
                {data.honors.map((h) => {
                  const lc = HONOR_COLORS[h.level] || { bg: C.textMuted, color: "#ffffff" };
                  return (
                    <View key={h.id} style={{ marginBottom: 4 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={{ fontWeight: 700, fontSize: 11, color: C.text }}>{getText(h.title, language)}</Text>
                          {h.level ? <Text style={[s.honorBadge, { backgroundColor: lc.bg, color: lc.color }]}>{h.level}</Text> : null}
                        </View>
                        {h.period ? <Text style={s.mainMuted}>{h.period}</Text> : null}
                      </View>
                      {getText(h.description, language) ? <Text style={s.mainBody}>{getText(h.description, language)}</Text> : null}
                    </View>
                  );
                })}
              </View>
            );
          case "experience":
            return (data.experience?.length ?? 0) === 0 ? null : (
              <View key="experience" style={{ marginBottom: 12 }}>
                <Text style={s.mainHeading}>{label("experience", language)}</Text>
                {data.experience.map((exp, idx) => (
                  <View key={exp.id}>
                    <View style={s.itemRow}>
                      <Text><Text style={s.mainBold}>{getText(exp.company, language)}</Text><Text style={s.mainSecondary}> · {getText(exp.role, language)}</Text></Text>
                      {exp.period ? <Text style={s.mainMuted}>{exp.period}</Text> : null}
                    </View>
                    {getText(exp.description, language) ? <Text style={s.mainBody}>{getText(exp.description, language)}</Text> : null}
                    {(exp.highlights?.length ?? 0) > 0 ? exp.highlights.map((h, i) => (
                      <View key={i} style={s.bullet}>
                        <Text style={s.bulletDot}>•</Text>
                        <Text style={s.bulletText}>{getText(h, language)}</Text>
                      </View>
                    )) : null}
                    {idx < data.experience.length - 1 ? <View style={s.itemDivider} /> : null}
                  </View>
                ))}
              </View>
            );
          case "projects":
            return (data.projects?.length ?? 0) === 0 ? null : (
              <View key="projects" style={{ marginBottom: 12 }}>
                <Text style={s.mainHeading}>{label("projects", language)}</Text>
                {data.projects.map((proj, idx) => (
                  <View key={proj.id}>
                    <View style={s.itemRow}>
                      <Text><Text style={s.mainBold}>{getText(proj.name, language)}</Text>{getText(proj.role, language) ? <Text style={s.mainSecondary}> · {getText(proj.role, language)}</Text> : null}</Text>
                      {proj.period ? <Text style={s.mainMuted}>{proj.period}</Text> : null}
                    </View>
                    {(proj.tech?.length ?? 0) > 0 ? (
                      <View style={s.tagRow}>
                        {proj.tech.map((t, i) => <Text key={i} style={s.tag}>{t}</Text>)}
                      </View>
                    ) : null}
                    {proj.link ? <Text style={s.link}>{proj.link}</Text> : null}
                    {getText(proj.description, language) ? <Text style={s.mainBody}>{getText(proj.description, language)}</Text> : null}
                    {idx < data.projects.length - 1 ? <View style={s.itemDivider} /> : null}
                  </View>
                ))}
              </View>
            );
          case "campusActivities":
            return (data.campusActivities?.length ?? 0) === 0 ? null : (
              <View key="campusActivities" style={{ marginBottom: 12 }}>
                <Text style={s.mainHeading}>{label("campusActivities", language)}</Text>
                {data.campusActivities.map((act, idx) => (
                  <View key={act.id}>
                    <View style={s.itemRow}>
                      <Text><Text style={s.mainBold}>{getText(act.organization, language)}</Text><Text style={s.mainSecondary}> · {getText(act.role, language)}</Text></Text>
                      {act.period ? <Text style={s.mainMuted}>{act.period}</Text> : null}
                    </View>
                    {getText(act.description, language) ? <Text style={s.mainBody}>{getText(act.description, language)}</Text> : null}
                    {(act.highlights?.length ?? 0) > 0 ? act.highlights.map((h, i) => (
                      <View key={i} style={s.bullet}>
                        <Text style={s.bulletDot}>•</Text>
                        <Text style={s.bulletText}>{getText(h, language)}</Text>
                      </View>
                    )) : null}
                    {idx < data.campusActivities.length - 1 ? <View style={s.itemDivider} /> : null}
                  </View>
                ))}
              </View>
            );
          default:
            return null;
        }
      })}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.row}>
          {renderSidebar()}
          {renderMain()}
        </View>
      </Page>
    </Document>
  );
}

function createMinimalPDF(data: ResumeData, sections: SectionKey[], emphasis: Partial<Record<SectionKey, SectionEmphasis>>, language: "zh" | "en") {
  const padding = TOKENS.page.padding.minimal;
  const s = StyleSheet.create({
    page: { paddingTop: padding.top, paddingRight: padding.right, paddingBottom: padding.bottom, paddingLeft: padding.left, fontFamily: "Noto", fontSize: TOKENS.fontSize.tag, color: C.text, lineHeight: 1.5 },
    nameRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 0 },
    name: { fontSize: 20, fontWeight: 700 },
    titleInline: { fontSize: 12, fontWeight: 400, color: C.textSecondary },
    contacts: { fontSize: 10, color: C.textSecondary, marginTop: 3, lineHeight: 1.5 },
    summary: { fontSize: 10, color: C.textMuted, marginTop: 4, lineHeight: 1.6 },
    sectionLine: { height: TOKENS.line.itemPx, backgroundColor: C.line, marginTop: TOKENS.spacing.sectionTop, marginBottom: 4 },
    sectionHead: { fontSize: TOKENS.fontSize.sectionTitle, fontWeight: 700, color: C.text, letterSpacing: 0, marginBottom: TOKENS.spacing.sectionTitleBottom },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    bold600: { fontWeight: 700, fontSize: TOKENS.fontSize.body, color: C.text },
    secondary: { fontSize: TOKENS.fontSize.body, color: C.textSecondary, fontWeight: 400 },
    muted: { fontSize: 10, color: C.textMuted },
    body10: { fontSize: 10, color: C.textMuted, lineHeight: 1.6 },
    bullet: { flexDirection: "row", marginLeft: 14, marginBottom: 0 },
    bulletDot: { width: 10, fontSize: 10, color: C.textMuted },
    bulletText: { flex: 1, fontSize: 10, color: C.textMuted, lineHeight: 1.6 },
    techRow: { fontSize: 10, color: C.textMuted, marginTop: 1 },
    link: { fontSize: 10, color: C.textMuted, marginTop: 1 },
    skillRow: { marginBottom: 4 },
    skillCat: { fontWeight: 700, fontSize: TOKENS.fontSize.body, color: C.text },
    skillItems: { fontWeight: 400, fontSize: TOKENS.fontSize.body, color: C.textSecondary },
  });

  const info = data.personalInfo;
  const name = getText(info.name, language);

  const renderPersonalInfo = () => {
    if (!name && !info.email) return null;
    const contactParts: string[] = [];
    const identityParts = [info.gender, info.birthDate, info.politicalStatus].filter(Boolean);
    if (identityParts.length > 0) contactParts.push(identityParts.join(" · "));
    if (info.phone) contactParts.push(info.phone);
    if (info.email) contactParts.push(info.email);
    if (getText(info.location, language)) contactParts.push(getText(info.location, language));
    if (info.website) contactParts.push(info.website);
    return (
      <View style={{ marginBottom: 6 }}>
        <View style={s.nameRow}>
          {name ? <Text style={s.name}>{name}</Text> : null}
          {getText(info.title, language) ? <Text style={s.titleInline}>{getText(info.title, language)}</Text> : null}
        </View>
        {contactParts.length > 0 ? <Text style={s.contacts}>{contactParts.join(" | ")}</Text> : null}
        {getText(info.summary, language) ? <Text style={s.summary}>{getText(info.summary, language)}</Text> : null}
      </View>
    );
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    personalInfo: renderPersonalInfo,
    education: () => (data.education?.length ?? 0) === 0 ? null : (
      <View>
        <View style={s.sectionLine} />
        <Text style={s.sectionHead}>{label("education", language)}</Text>
        {data.education.map((edu) => {
          const parts = [getText(edu.degree, language), getText(edu.major, language)].filter(Boolean);
          return (
            <View key={edu.id} style={{ marginTop: 6 }}>
              <View style={s.row}>
                <Text><Text style={s.bold600}>{getText(edu.school, language)}</Text>{schoolTierText(edu, language, C.textMuted)}{parts.length > 0 ? <Text style={s.secondary}> · {parts.join(" · ")}</Text> : null}</Text>
                {edu.period ? <Text style={s.muted}>{edu.period}</Text> : null}
              </View>
              {edu.gpa ? <Text style={s.muted}>GPA: {edu.gpa}</Text> : null}
              {getText(edu.description, language) ? <Text style={s.body10}>{getText(edu.description, language)}</Text> : null}
            </View>
          );
        })}
      </View>
    ),
    honors: () => (data.honors?.length ?? 0) === 0 ? null : (
      <View>
        <View style={s.sectionLine} />
        <Text style={s.sectionHead}>{label("honors", language)}</Text>
        {data.honors.map((h) => (
          <View key={h.id} style={{ marginTop: 4 }}>
            <View style={s.row}>
              <Text><Text style={{ fontSize: 11, color: C.text }}>{getText(h.title, language)}{h.level ? <Text style={{ fontSize: 10, color: C.textMuted }}> [{h.level}]</Text> : null}</Text></Text>
              {h.period ? <Text style={s.muted}>{h.period}</Text> : null}
            </View>
            {getText(h.description, language) ? <Text style={s.body10}>{getText(h.description, language)}</Text> : null}
          </View>
        ))}
      </View>
    ),
    experience: () => (data.experience?.length ?? 0) === 0 ? null : (
      <View>
        <View style={s.sectionLine} />
        <Text style={s.sectionHead}>{label("experience", language)}</Text>
        {data.experience.map((exp) => (
          <View key={exp.id} style={{ marginTop: 6 }}>
            <View style={s.row}>
              <Text><Text style={s.bold600}>{getText(exp.company, language)}</Text>{getText(exp.role, language) ? <Text style={s.secondary}> · {getText(exp.role, language)}</Text> : null}</Text>
              {exp.period ? <Text style={s.muted}>{exp.period}</Text> : null}
            </View>
            {getText(exp.description, language) ? <Text style={s.body10}>{getText(exp.description, language)}</Text> : null}
            {(exp.highlights?.length ?? 0) > 0 ? exp.highlights.map((h, i) => (
              <View key={i} style={s.bullet}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{getText(h, language)}</Text>
              </View>
            )) : null}
          </View>
        ))}
      </View>
    ),
    projects: () => (data.projects?.length ?? 0) === 0 ? null : (
      <View>
        <View style={s.sectionLine} />
        <Text style={s.sectionHead}>{label("projects", language)}</Text>
        {data.projects.map((proj) => (
          <View key={proj.id} style={{ marginTop: 6 }}>
            <View style={s.row}>
              <Text><Text style={s.bold600}>{getText(proj.name, language)}</Text>{getText(proj.role, language) ? <Text style={s.secondary}> · {getText(proj.role, language)}</Text> : null}</Text>
              {proj.period ? <Text style={s.muted}>{proj.period}</Text> : null}
            </View>
            {(proj.tech?.length ?? 0) > 0 ? <Text style={s.techRow}>Tech: {proj.tech.join(", ")}</Text> : null}
            {proj.link ? <Text style={s.link}>{proj.link}</Text> : null}
            {getText(proj.description, language) ? <Text style={s.body10}>{getText(proj.description, language)}</Text> : null}
          </View>
        ))}
      </View>
    ),
    campusActivities: () => (data.campusActivities?.length ?? 0) === 0 ? null : (
      <View>
        <View style={s.sectionLine} />
        <Text style={s.sectionHead}>{label("campusActivities", language)}</Text>
        {data.campusActivities.map((act) => (
          <View key={act.id} style={{ marginTop: 6 }}>
            <View style={s.row}>
              <Text><Text style={s.bold600}>{getText(act.organization, language)}</Text>{getText(act.role, language) ? <Text style={s.secondary}> · {getText(act.role, language)}</Text> : null}</Text>
              {act.period ? <Text style={s.muted}>{act.period}</Text> : null}
            </View>
            {getText(act.description, language) ? <Text style={s.body10}>{getText(act.description, language)}</Text> : null}
            {(act.highlights?.length ?? 0) > 0 ? act.highlights.map((h, i) => (
              <View key={i} style={s.bullet}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{getText(h, language)}</Text>
              </View>
            )) : null}
          </View>
        ))}
      </View>
    ),
    skills: () => (data.skills?.length ?? 0) === 0 ? null : (
      <View>
        <View style={s.sectionLine} />
        <Text style={s.sectionHead}>{label("skills", language)}</Text>
        {data.skills.map((cat) => (
          <View key={cat.id} style={s.skillRow}>
            <Text><Text style={s.skillCat}>{getText(cat.category, language)}: </Text><Text style={s.skillItems}>{(cat.items ?? []).join(" | ")}</Text></Text>
          </View>
        ))}
      </View>
    ),
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {sections.map((key) => <View key={key}>{sectionRenderers[key]?.()}</View>)}
      </Page>
    </Document>
  );
}

function createCompactPDF(data: ResumeData, sections: SectionKey[], emphasis: Partial<Record<SectionKey, SectionEmphasis>>, language: "zh" | "en") {
  const padding = TOKENS.page.padding.compact;
  const s = StyleSheet.create({
    page: { paddingTop: padding.top, paddingRight: padding.right, paddingBottom: padding.bottom, paddingLeft: padding.left, fontFamily: "Noto", fontSize: TOKENS.fontSize.meta, color: C.text, lineHeight: 1.45 },
    nameLine: { fontSize: 18, fontWeight: 700, marginBottom: 2, lineHeight: 1.3 },
    contacts: { fontSize: 10, color: C.textSecondary, lineHeight: 1.4, marginTop: 2 },
    summary: { fontSize: 10, color: C.textSecondary, lineHeight: 1.45, fontStyle: "italic", marginTop: 2 },
    sectionHead: { fontSize: TOKENS.fontSize.sectionTitle - 2, fontWeight: 700, color: C.text, borderLeftWidth: TOKENS.line.sectionStrongPx, borderLeftColor: C.accentBlue, paddingLeft: 6, marginTop: 6, marginBottom: 4, lineHeight: 1.3 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    bold600: { fontWeight: 700, fontSize: 10.5 },
    secondary: { fontSize: TOKENS.fontSize.meta, color: C.textSecondary },
    muted: { fontSize: 10, color: C.textMuted },
    bullet: { flexDirection: "row", marginLeft: 14 },
    bulletDot: { width: 10, fontSize: TOKENS.fontSize.meta, color: C.textSecondary },
    bulletText: { flex: 1, fontSize: TOKENS.fontSize.meta, color: C.textSecondary, lineHeight: 1.45 },
    link: { fontSize: 9, color: C.textMuted, marginTop: 1 },
  });

  const info = data.personalInfo;
  const name = getText(info.name, language);

  const renderPersonalInfo = () => {
    if (!name && !info.email) return null;
    const title = getText(info.title, language);
    const headerLine = title ? `${name} | ${title}` : name;
    const contactParts: string[] = [];
    if (info.gender) contactParts.push(info.gender);
    if (info.birthDate) contactParts.push(info.birthDate);
    if (info.politicalStatus) contactParts.push(info.politicalStatus);
    if (info.phone) contactParts.push(info.phone);
    if (info.email) contactParts.push(info.email);
    if (getText(info.location, language)) contactParts.push(getText(info.location, language));
    if (info.website) contactParts.push(info.website);
    return (
      <View style={{ marginBottom: 8 }}>
        {headerLine ? <Text style={s.nameLine}>{headerLine}</Text> : null}
        {contactParts.length > 0 ? <Text style={s.contacts}>{contactParts.join(" | ")}</Text> : null}
        {getText(info.summary, language) ? <Text style={s.summary}>{getText(info.summary, language)}</Text> : null}
      </View>
    );
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    personalInfo: renderPersonalInfo,
    education: () => (data.education?.length ?? 0) === 0 ? null : (
      <View>
        <Text style={s.sectionHead}>{label("education", language)}</Text>
        {data.education.map((edu) => {
          const parts = [getText(edu.degree, language), getText(edu.major, language)].filter(Boolean);
          return (
            <View key={edu.id} style={{ marginBottom: 4 }}>
              <View style={s.row}>
                <Text style={s.bold600}>{getText(edu.school, language)}{schoolTierText(edu, language, C.textMuted, 8.5)}{parts.length ? `${getText(edu.school, language) ? " · " : ""}${parts.join(" · ")}` : ""}</Text>
                {edu.period ? <Text style={s.muted}>{edu.period}</Text> : null}
              </View>
              {edu.gpa ? <Text style={s.secondary}>GPA: {edu.gpa}</Text> : null}
              {getText(edu.description, language) ? <Text style={s.secondary}>{getText(edu.description, language)}</Text> : null}
            </View>
          );
        })}
      </View>
    ),
    honors: () => (data.honors?.length ?? 0) === 0 ? null : (
      <View>
        <Text style={s.sectionHead}>{label("honors", language)}</Text>
        {data.honors.map((h) => (
          <View key={h.id} style={{ marginBottom: 2 }}>
            <View style={s.row}>
              <Text style={s.bold600}>{getText(h.title, language)}{h.level ? ` [${h.level}]` : ""}</Text>
              {h.period ? <Text style={s.muted}>{h.period}</Text> : null}
            </View>
            {getText(h.description, language) ? <Text style={s.secondary}>{getText(h.description, language)}</Text> : null}
          </View>
        ))}
      </View>
    ),
    experience: () => (data.experience?.length ?? 0) === 0 ? null : (
      <View>
        <Text style={s.sectionHead}>{label("experience", language)}</Text>
        {data.experience.map((exp) => (
          <View key={exp.id} style={{ marginBottom: 4 }}>
            <View style={s.row}>
              <Text style={s.bold600}>{getText(exp.company, language)} · {getText(exp.role, language)}</Text>
              {exp.period ? <Text style={s.muted}>{exp.period}</Text> : null}
            </View>
            {getText(exp.description, language) ? <Text style={s.secondary}>{getText(exp.description, language)}</Text> : null}
            {(exp.highlights?.length ?? 0) > 0 ? exp.highlights.map((h, i) => (
              <View key={i} style={s.bullet}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{getText(h, language)}</Text>
              </View>
            )) : null}
          </View>
        ))}
      </View>
    ),
    projects: () => (data.projects?.length ?? 0) === 0 ? null : (
      <View>
        <Text style={s.sectionHead}>{label("projects", language)}</Text>
        {data.projects.map((proj) => (
          <View key={proj.id} style={{ marginBottom: 4 }}>
            <View style={s.row}>
              <Text style={s.bold600}>{getText(proj.name, language)}{getText(proj.role, language) ? ` · ${getText(proj.role, language)}` : ""}</Text>
              {proj.period ? <Text style={s.muted}>{proj.period}</Text> : null}
            </View>
            {(proj.tech?.length ?? 0) > 0 ? <Text style={{ fontSize: 9.5, color: C.textMuted }}>{language === "zh" ? "技术" : "Tech"}: {proj.tech.join(", ")}</Text> : null}
            {proj.link ? <Text style={s.link}>{proj.link}</Text> : null}
            {getText(proj.description, language) ? <Text style={s.secondary}>{getText(proj.description, language)}</Text> : null}
          </View>
        ))}
      </View>
    ),
    campusActivities: () => (data.campusActivities?.length ?? 0) === 0 ? null : (
      <View>
        <Text style={s.sectionHead}>{label("campusActivities", language)}</Text>
        {data.campusActivities.map((act) => (
          <View key={act.id} style={{ marginBottom: 4 }}>
            <View style={s.row}>
              <Text style={s.bold600}>{getText(act.organization, language)} · {getText(act.role, language)}</Text>
              {act.period ? <Text style={s.muted}>{act.period}</Text> : null}
            </View>
            {getText(act.description, language) ? <Text style={s.secondary}>{getText(act.description, language)}</Text> : null}
            {(act.highlights?.length ?? 0) > 0 ? act.highlights.map((h, i) => (
              <View key={i} style={s.bullet}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{getText(h, language)}</Text>
              </View>
            )) : null}
          </View>
        ))}
      </View>
    ),
    skills: () => (data.skills?.length ?? 0) === 0 ? null : (
      <View>
        <Text style={s.sectionHead}>{label("skills", language)}</Text>
        <Text style={{ fontSize: 10.5, lineHeight: 1.5 }}>
          {data.skills.map((cat, i) => (
            <Text key={cat.id}>
              <Text style={{ fontWeight: 700 }}>{getText(cat.category, language)}</Text>
              <Text style={{ color: C.textSecondary }}>: {cat.items.join(", ")}</Text>
              {i < data.skills.length - 1 ? <Text style={{ color: C.textMuted }}> | </Text> : null}
            </Text>
          ))}
        </Text>
      </View>
    ),
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {sections.map((key) => <View key={key}>{sectionRenderers[key]?.()}</View>)}
      </Page>
    </Document>
  );
}
