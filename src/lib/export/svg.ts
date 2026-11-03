import type { Education, ResumeData, SectionKey, SectionEmphasis } from "@/types";
import { normalizeSchoolTier } from "@/types";

interface SVGExportOptions {
  data: ResumeData;
  sectionOrder: SectionKey[];
  emphasis: Partial<Record<SectionKey, SectionEmphasis>>;
  language: "zh" | "en";
  template: "classic" | "modern" | "minimal" | "compact";
  fontScale?: number;
  width?: number;
  height?: number;
}

const FONT = "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif";

function esc(str: string): string {
  return str.replace(/\*\*([^*\n]+?)\*\*/g, "$1").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function getText(b: { zh: string; en: string } | undefined | null, lang: "zh" | "en"): string {
  if (!b) return "";
  const raw = lang === "zh" ? b.zh || b.en : b.en || b.zh;
  return raw.replace(/\*\*([^*\n]+?)\*\*/g, "$1");
}

function schoolHeading(edu: Education, language: "zh" | "en", fontSize: number, color: string): string {
  const school = getText(edu.school, language);
  if (!school) return "";
  const tier = normalizeSchoolTier(edu.schoolTier);
  return `<tspan font-weight="700">${esc(school)}</tspan>` + (tier
    ? `<tspan data-school-tier="${tier}" dx="5" font-size="${fontSize}" font-weight="600" fill="${color}">${tier}</tspan>`
    : "");
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

function lbl(key: SectionKey, lang: "zh" | "en") {
  return lang === "zh" ? SECTION_LABELS[key].zh : SECTION_LABELS[key].en;
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const isCJK = (ch: string) => /[\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/.test(ch);
  const charW = (ch: string) => isCJK(ch) ? fontSize * 0.9 : fontSize * 0.55;
  const lines: string[] = [];
  let line = "";
  let lineW = 0;
  for (const ch of text.replace(/\*\*([^*\n]+?)\*\*/g, "$1")) {
    const w = charW(ch);
    if (lineW + w > maxWidth && line.length > 0) {
      lines.push(line);
      line = ch;
      lineW = w;
    } else {
      line += ch;
      lineW += w;
    }
  }
  if (line) lines.push(line);
  return lines.length > 0 ? lines : [text];
}

export function generateSVG(options: SVGExportOptions): string {
  const { data, sectionOrder, emphasis, language, template } = options;
  const visibleSections = sectionOrder.filter(
    (key) => key === "personalInfo" || emphasis[key] !== "hidden"
  );

  switch (template) {
    case "modern": return generateModernSVG(data, visibleSections, emphasis, language);
    case "minimal": return generateMinimalSVG(data, visibleSections, emphasis, language);
    case "compact": return generateCompactSVG(data, visibleSections, emphasis, language);
    default: return generateClassicSVG(data, visibleSections, emphasis, language);
  }
}

function generateClassicSVG(data: ResumeData, sections: SectionKey[], emphasis: Partial<Record<SectionKey, SectionEmphasis>>, language: "zh" | "en") {
  const W = 794, P = 36;
  const CW = W - P * 2;
  const C = { text: "#1a1a1a", sec: "#555", muted: "#999", line: "#000", lightLine: "#ccc", tagBg: "#f5f5f5", tagBorder: "#e0e0e0", tagText: "#555" };
  let y = 28;
  const els: string[] = [];

  for (const key of sections) {
    if (key === "personalInfo") {
      const info = data.personalInfo;
      const name = getText(info.name, language);
      if (!name && !info.email) continue;
      if (name) { els.push(`<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="22" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(name)}</text>`); y += 28; }
      const title = getText(info.title, language);
      if (title) { els.push(`<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="13" fill="${C.sec}" font-family="${FONT}">${esc(title)}</text>`); y += 20; }
      const cs = [info.gender, info.birthDate, info.politicalStatus, info.phone, info.email, getText(info.location, language), info.website].filter(Boolean);
      if (cs.length > 0) { els.push(`<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="11" fill="${C.sec}" font-family="${FONT}">${esc(cs.join("  |  "))}</text>`); y += 18; }
      const summary = getText(info.summary, language);
      if (summary) { for (const ln of wrapText(summary, CW, 11)) { els.push(`<text x="${P}" y="${y}" font-size="11" fill="${C.sec}" font-family="${FONT}">${esc(ln)}</text>`); y += 17; } }
      y += 4;
      els.push(`<line x1="${P}" y1="${y}" x2="${W - P}" y2="${y}" stroke="${C.lightLine}" stroke-width="1"/>`);
      y += 14;
    } else if (key === "education" && (data.education?.length ?? 0) > 0) {
      els.push(`<text x="${P}" y="${y}" font-size="14" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(lbl("education", language))}</text>`);
      y += 3;
      els.push(`<line x1="${P}" y1="${y}" x2="${W - P}" y2="${y}" stroke="${C.line}" stroke-width="1.5"/>`);
      y += 12;
      for (const edu of data.education) {
        const parts = [getText(edu.major, language), getText(edu.degree, language)].filter(Boolean);
        const school = schoolHeading(edu, language, 10, C.muted);
        els.push(`<text x="${P}" y="${y}" font-size="12" font-weight="700" fill="${C.text}" font-family="${FONT}">${school}${parts.length ? `${school ? " · " : ""}${esc(parts.join(" · "))}` : ""}</text>`);
        if (edu.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="11" fill="${C.muted}" font-family="${FONT}">${esc(edu.period)}</text>`);
        y += 17;
        const details: string[] = [];
        if (edu.gpa) details.push(`GPA: ${edu.gpa}`);
        if (details.length > 0) { els.push(`<text x="${P}" y="${y}" font-size="11" fill="${C.sec}" font-family="${FONT}">${esc(details.join(" | "))}</text>`); y += 16; }
        y += 4;
      }
      y += 6;
    } else if (key === "honors" && (data.honors?.length ?? 0) > 0) {
      els.push(`<text x="${P}" y="${y}" font-size="14" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(lbl("honors", language))}</text>`);
      y += 3;
      els.push(`<line x1="${P}" y1="${y}" x2="${W - P}" y2="${y}" stroke="${C.line}" stroke-width="1.5"/>`);
      y += 12;
      for (const h of data.honors) {
        els.push(`<text x="${P}" y="${y}" font-size="11" font-weight="600" fill="${C.text}" font-family="${FONT}">${esc(getText(h.title, language))}${h.level ? ` [${esc(h.level)}]` : ""}</text>`);
        if (h.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="11" fill="${C.muted}" font-family="${FONT}">${esc(h.period)}</text>`);
        y += 17;
      }
      y += 6;
    } else if (key === "experience" && (data.experience?.length ?? 0) > 0) {
      els.push(`<text x="${P}" y="${y}" font-size="14" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(lbl("experience", language))}</text>`);
      y += 3;
      els.push(`<line x1="${P}" y1="${y}" x2="${W - P}" y2="${y}" stroke="${C.line}" stroke-width="1.5"/>`);
      y += 12;
      for (const exp of data.experience) {
        els.push(`<text x="${P}" y="${y}" font-size="12" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(getText(exp.company, language))}<tspan font-weight="400"> · ${esc(getText(exp.role, language))}</tspan></text>`);
        if (exp.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="11" fill="${C.muted}" font-family="${FONT}">${esc(exp.period)}</text>`);
        y += 17;
        const desc = getText(exp.description, language);
        if (desc) { for (const ln of wrapText(desc, CW, 11)) { els.push(`<text x="${P}" y="${y}" font-size="11" fill="${C.sec}" font-family="${FONT}">${esc(ln)}</text>`); y += 17; } }
        if (exp.highlights?.length) { for (const h of exp.highlights) { els.push(`<text x="${P + 14}" y="${y}" font-size="11" fill="${C.sec}" font-family="${FONT}">• ${esc(getText(h, language))}</text>`); y += 17; } }
        y += 4;
      }
      y += 6;
    } else if (key === "projects" && (data.projects?.length ?? 0) > 0) {
      els.push(`<text x="${P}" y="${y}" font-size="14" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(lbl("projects", language))}</text>`);
      y += 3;
      els.push(`<line x1="${P}" y1="${y}" x2="${W - P}" y2="${y}" stroke="${C.line}" stroke-width="1.5"/>`);
      y += 12;
      for (const proj of data.projects) {
        els.push(`<text x="${P}" y="${y}" font-size="12" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(getText(proj.name, language))}</text>`);
        if (proj.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="11" fill="${C.muted}" font-family="${FONT}">${esc(proj.period)}</text>`);
        y += 17;
        if (proj.tech?.length) { els.push(`<text x="${P}" y="${y}" font-size="11" fill="${C.sec}" font-family="${FONT}">${esc(proj.tech.join(" · "))}</text>`); y += 17; }
        const desc = getText(proj.description, language);
        if (desc) { for (const ln of wrapText(desc, CW, 11)) { els.push(`<text x="${P}" y="${y}" font-size="11" fill="${C.sec}" font-family="${FONT}">${esc(ln)}</text>`); y += 17; } }
        y += 4;
      }
      y += 6;
    } else if (key === "campusActivities" && (data.campusActivities?.length ?? 0) > 0) {
      els.push(`<text x="${P}" y="${y}" font-size="14" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(lbl("campusActivities", language))}</text>`);
      y += 3;
      els.push(`<line x1="${P}" y1="${y}" x2="${W - P}" y2="${y}" stroke="${C.line}" stroke-width="1.5"/>`);
      y += 12;
      for (const act of data.campusActivities) {
        els.push(`<text x="${P}" y="${y}" font-size="12" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(getText(act.organization, language))}<tspan font-weight="400"> · ${esc(getText(act.role, language))}</tspan></text>`);
        if (act.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="11" fill="${C.muted}" font-family="${FONT}">${esc(act.period)}</text>`);
        y += 17;
        const desc = getText(act.description, language);
        if (desc) { for (const ln of wrapText(desc, CW, 11)) { els.push(`<text x="${P}" y="${y}" font-size="11" fill="${C.sec}" font-family="${FONT}">${esc(ln)}</text>`); y += 17; } }
        if (act.highlights?.length) { for (const h of act.highlights) { els.push(`<text x="${P + 14}" y="${y}" font-size="11" fill="${C.sec}" font-family="${FONT}">• ${esc(getText(h, language))}</text>`); y += 17; } }
        y += 4;
      }
      y += 6;
    } else if (key === "skills" && (data.skills?.length ?? 0) > 0) {
      els.push(`<text x="${P}" y="${y}" font-size="14" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(lbl("skills", language))}</text>`);
      y += 3;
      els.push(`<line x1="${P}" y1="${y}" x2="${W - P}" y2="${y}" stroke="${C.line}" stroke-width="1.5"/>`);
      y += 12;
      for (const cat of data.skills) {
        els.push(`<text x="${P}" y="${y}" font-size="11" font-family="${FONT}"><tspan font-weight="700">${esc(getText(cat.category, language))}：</tspan><tspan fill="${C.sec}">${esc((cat.items ?? []).join(" | "))}</tspan></text>`);
        y += 20;
      }
      y += 6;
    }
  }

  const height = Math.max(y + P, 1123);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}">
  <rect width="${W}" height="${height}" fill="white"/>
  ${els.join("\n  ")}
</svg>`;
}

function generateModernSVG(data: ResumeData, sections: SectionKey[], emphasis: Partial<Record<SectionKey, SectionEmphasis>>, language: "zh" | "en") {
  const W = 794, SW = 240, MP = 24;
  const SB = { bg: "#2c3e50", text: "#ecf0f1", muted: "#bdc3c7", accent: "#3498db" };
  const MC = { text: "#2c3e50", sec: "#555", muted: "#7f8c8d", line: "#3498db", border: "#e0e4e8" };
  let sy = 24, my = 24;
  const sbEls: string[] = [], mainEls: string[] = [];

  const info = data.personalInfo;
  const name = getText(info.name, language);
  const defsEls: string[] = [];
  // Avatar: clipPath for circle image
  defsEls.push(`<clipPath id="avatarClip"><circle cx="${SW / 2}" cy="60" r="36"/></clipPath>`);
  if (name) {
    if (info.avatarUrl) {
      sbEls.push(`<image x="${SW / 2 - 36}" y="24" width="72" height="72" clip-path="url(#avatarClip)" href="${esc(info.avatarUrl)}"/>`);
    } else {
      sbEls.push(`<circle cx="${SW / 2}" cy="60" r="36" fill="rgba(255,255,255,0.15)"/>`);
      sbEls.push(`<text x="${SW / 2}" y="65" text-anchor="middle" font-size="28" fill="${SB.muted}" font-family="${FONT}" font-weight="300">${esc(name.charAt(0))}</text>`);
    }
    sy += 82;
  }
  if (name) { sbEls.push(`<text x="${SW / 2}" y="${sy}" text-anchor="middle" font-size="20" font-weight="700" fill="${SB.text}" font-family="${FONT}">${esc(name)}</text>`); sy += 26; }
  const title = getText(info.title, language);
  if (title) { sbEls.push(`<text x="${SW / 2}" y="${sy}" text-anchor="middle" font-size="11" fill="${SB.muted}" font-family="${FONT}">${esc(title)}</text>`); sy += 18; }
  sy += 6;
  sbEls.push(`<line x1="16" y1="${sy}" x2="${SW - 16}" y2="${sy}" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>`);
  sy += 12;
  const idParts = [info.gender, info.birthDate, info.politicalStatus].filter(Boolean);
  if (idParts.length > 0) { sbEls.push(`<text x="16" y="${sy}" font-size="10" fill="${SB.muted}" font-family="${FONT}">${esc(idParts.join(" · "))}</text>`); sy += 18; }
  if (info.phone) { sbEls.push(`<text x="16" y="${sy}" font-size="10" fill="${SB.muted}" font-family="${FONT}">📱 ${esc(info.phone)}</text>`); sy += 18; }
  if (info.email) { sbEls.push(`<text x="16" y="${sy}" font-size="10" fill="${SB.muted}" font-family="${FONT}">✉ ${esc(info.email)}</text>`); sy += 18; }
  if (getText(info.location, language)) { sbEls.push(`<text x="16" y="${sy}" font-size="10" fill="${SB.muted}" font-family="${FONT}">📍 ${esc(getText(info.location, language))}</text>`); sy += 18; }
  if (info.website) { sbEls.push(`<text x="16" y="${sy}" font-size="10" fill="${SB.muted}" font-family="${FONT}">🔗 ${esc(info.website)}</text>`); sy += 18; }

  if (data.skills?.length) {
    sy += 12;
    sbEls.push(`<text x="16" y="${sy}" font-size="13" font-weight="700" fill="${SB.text}" font-family="${FONT}">${esc(lbl("skills", language))}</text>`);
    sy += 4;
    sbEls.push(`<line x1="16" y1="${sy}" x2="${SW - 16}" y2="${sy}" stroke="${SB.accent}" stroke-width="2"/>`);
    sy += 10;
    for (const cat of data.skills) {
      sbEls.push(`<text x="16" y="${sy}" font-size="10" font-weight="700" fill="${SB.muted}" font-family="${FONT}">${esc(getText(cat.category, language))}</text>`);
      sy += 14;
      sbEls.push(`<text x="16" y="${sy}" font-size="10" fill="${SB.text}" font-family="${FONT}">${esc((cat.items ?? []).join(" · "))}</text>`);
      sy += 18;
    }
  }

  const mainKeys = sections.filter(k => !["personalInfo", "skills"].includes(k));

  for (const key of mainKeys) {
    if (my > 24) my += 4;
    mainEls.push(`<text x="${SW + MP}" y="${my}" font-size="13" font-weight="700" fill="${MC.text}" font-family="${FONT}">${esc(lbl(key as SectionKey, language))}</text>`);
    my += 3;
    mainEls.push(`<line x1="${SW + MP}" y1="${my}" x2="${W - MP}" y2="${my}" stroke="${MC.line}" stroke-width="2"/>`);
    my += 12;

    if (key === "education" && data.education?.length) {
      for (const edu of data.education) {
        const parts = [getText(edu.degree, language), getText(edu.major, language)].filter(Boolean);
        const school = schoolHeading(edu, language, 9.5, MC.muted);
        mainEls.push(`<text x="${SW + MP}" y="${my}" font-size="11" font-weight="700" fill="${MC.text}" font-family="${FONT}">${school}${parts.length ? `${school ? " · " : ""}${esc(parts.join(" · "))}` : ""}</text>`);
        if (edu.period) mainEls.push(`<text x="${W - MP}" y="${my}" text-anchor="end" font-size="10" fill="${MC.muted}" font-family="${FONT}">${esc(edu.period)}</text>`);
        my += 16;
        if (edu.gpa) {
          mainEls.push(`<text x="${SW + MP}" y="${my}" font-size="10" fill="${MC.sec}" font-family="${FONT}">GPA: ${esc(edu.gpa)}</text>`);
          my += 15;
        }
        my += 6;
      }
    } else if (key === "honors" && data.honors?.length) {
      for (const h of data.honors) {
        mainEls.push(`<text x="${SW + MP}" y="${my}" font-size="11" font-weight="700" fill="${MC.text}" font-family="${FONT}">${esc(getText(h.title, language))}${h.level ? ` [${esc(h.level)}]` : ""}</text>`);
        if (h.period) mainEls.push(`<text x="${W - MP}" y="${my}" text-anchor="end" font-size="10" fill="${MC.muted}" font-family="${FONT}">${esc(h.period)}</text>`);
        my += 17;
      }
    } else if (key === "experience" && data.experience?.length) {
      data.experience.forEach((exp, idx) => {
        mainEls.push(`<text x="${SW + MP}" y="${my}" font-size="11" font-weight="700" fill="${MC.text}" font-family="${FONT}">${esc(getText(exp.company, language))}<tspan font-weight="400" fill="${MC.sec}"> · ${esc(getText(exp.role, language))}</tspan></text>`);
        if (exp.period) mainEls.push(`<text x="${W - MP}" y="${my}" text-anchor="end" font-size="10" fill="${MC.muted}" font-family="${FONT}">${esc(exp.period)}</text>`);
        my += 17;
        if (exp.highlights?.length) { for (const h of exp.highlights) { mainEls.push(`<text x="${SW + MP + 14}" y="${my}" font-size="10.5" fill="${MC.sec}" font-family="${FONT}">• ${esc(getText(h, language))}</text>`); my += 16; } }
        if (idx < data.experience.length - 1) { mainEls.push(`<line x1="${SW + MP}" y1="${my}" x2="${W - MP}" y2="${my}" stroke="${MC.border}" stroke-width="0.5"/>`); my += 8; }
      });
    } else if (key === "projects" && data.projects?.length) {
      data.projects.forEach((proj, idx) => {
        const titleStr = getText(proj.name, language) + (getText(proj.role, language) ? ` · ${getText(proj.role, language)}` : "");
        mainEls.push(`<text x="${SW + MP}" y="${my}" font-size="11" font-weight="700" fill="${MC.text}" font-family="${FONT}">${esc(titleStr)}</text>`);
        if (proj.period) mainEls.push(`<text x="${W - MP}" y="${my}" text-anchor="end" font-size="10" fill="${MC.muted}" font-family="${FONT}">${esc(proj.period)}</text>`);
        my += 17;
        if (proj.tech?.length) { mainEls.push(`<text x="${SW + MP}" y="${my}" font-size="10" fill="${MC.sec}" font-family="${FONT}">${esc(proj.tech.join(" · "))}</text>`); my += 16; }
        if (idx < data.projects.length - 1) { mainEls.push(`<line x1="${SW + MP}" y1="${my}" x2="${W - MP}" y2="${my}" stroke="${MC.border}" stroke-width="0.5"/>`); my += 8; }
      });
    } else if (key === "campusActivities" && data.campusActivities?.length) {
      data.campusActivities.forEach((act, idx) => {
        mainEls.push(`<text x="${SW + MP}" y="${my}" font-size="11" font-weight="700" fill="${MC.text}" font-family="${FONT}">${esc(getText(act.organization, language))}<tspan font-weight="400" fill="${MC.sec}"> · ${esc(getText(act.role, language))}</tspan></text>`);
        if (act.period) mainEls.push(`<text x="${W - MP}" y="${my}" text-anchor="end" font-size="10" fill="${MC.muted}" font-family="${FONT}">${esc(act.period)}</text>`);
        my += 17;
        if (act.highlights?.length) { for (const h of act.highlights) { mainEls.push(`<text x="${SW + MP + 14}" y="${my}" font-size="10.5" fill="${MC.sec}" font-family="${FONT}">• ${esc(getText(h, language))}</text>`); my += 16; } }
        if (idx < data.campusActivities.length - 1) { mainEls.push(`<line x1="${SW + MP}" y1="${my}" x2="${W - MP}" y2="${my}" stroke="${MC.border}" stroke-width="0.5"/>`); my += 8; }
      });
    }
    my += 8;
  }

  const height = Math.max(sy + 24, my + 24, 1123);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}">
  <defs>
    ${defsEls.join("\n  ")}
  </defs>
  <rect width="${W}" height="${height}" fill="white"/>
  <rect x="0" y="0" width="${SW}" height="${height}" fill="${SB.bg}"/>
  ${sbEls.join("\n  ")}
  ${mainEls.join("\n  ")}
</svg>`;
}

function generateMinimalSVG(data: ResumeData, sections: SectionKey[], emphasis: Partial<Record<SectionKey, SectionEmphasis>>, language: "zh" | "en") {
  const W = 794, P = 32;
  const CW = W - P * 2;
  const C = { text: "#1a1a1a", sec: "#666", muted: "#999", line: "#ddd" };
  let y = 24;
  const els: string[] = [];

  for (const key of sections) {
    if (key === "personalInfo") {
      const info = data.personalInfo;
      const name = getText(info.name, language);
      if (!name && !info.email) continue;
      const title = getText(info.title, language);
      if (name && title) { els.push(`<text x="${P}" y="${y}" font-size="20" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(name)} <tspan font-weight="400" font-size="12" fill="${C.sec}">${esc(title)}</tspan></text>`); y += 26; }
      else if (name) { els.push(`<text x="${P}" y="${y}" font-size="20" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(name)}</text>`); y += 26; }
      const cs: string[] = [];
      const idParts = [info.gender, info.birthDate, info.politicalStatus].filter(Boolean);
      if (idParts.length) cs.push(idParts.join(" · "));
      if (info.phone) cs.push(info.phone);
      if (info.email) cs.push(info.email);
      if (getText(info.location, language)) cs.push(getText(info.location, language));
      if (info.website) cs.push(info.website);
      if (cs.length) { els.push(`<text x="${P}" y="${y}" font-size="10" fill="${C.sec}" font-family="${FONT}">${esc(cs.join(" | "))}</text>`); y += 16; }
      const summary = getText(info.summary, language);
      if (summary) { for (const ln of wrapText(summary, CW, 10)) { els.push(`<text x="${P}" y="${y}" font-size="10" fill="${C.muted}" font-family="${FONT}">${esc(ln)}</text>`); y += 15; } }
    } else {
      y += 16;
      els.push(`<line x1="${P}" y1="${y}" x2="${W - P}" y2="${y}" stroke="${C.line}" stroke-width="0.5"/>`);
      y += 4;
      els.push(`<text x="${P}" y="${y}" font-size="13" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(lbl(key as SectionKey, language))}</text>`);
      y += 8;

      if (key === "education" && data.education?.length) {
        for (const edu of data.education) {
          y += 6;
          const parts = [getText(edu.degree, language), getText(edu.major, language)].filter(Boolean);
          const school = schoolHeading(edu, language, 9.5, C.muted);
          els.push(`<text x="${P}" y="${y}" font-size="11" fill="${C.text}" font-family="${FONT}">${school}${parts.length ? `<tspan fill="${C.sec}">${school ? " · " : ""}${esc(parts.join(" · "))}</tspan>` : ""}</text>`);
          if (edu.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="10" fill="${C.muted}" font-family="${FONT}">${esc(edu.period)}</text>`);
          y += 16;
          const ds: string[] = [];
          if (edu.gpa) ds.push(`GPA: ${edu.gpa}`);
          if (ds.length) { els.push(`<text x="${P}" y="${y}" font-size="10" fill="${C.muted}" font-family="${FONT}">${esc(ds.join("; "))}</text>`); y += 16; }
        }
      } else if (key === "honors" && data.honors?.length) {
        for (const h of data.honors) {
          y += 4;
          els.push(`<text x="${P}" y="${y}" font-size="11" fill="${C.text}" font-family="${FONT}">${esc(getText(h.title, language))}${h.level ? `<tspan font-size="10" fill="${C.muted}"> [${esc(h.level)}]</tspan>` : ""}</text>`);
          if (h.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="10" fill="${C.muted}" font-family="${FONT}">${esc(h.period)}</text>`);
          y += 16;
        }
      } else if (key === "experience" && data.experience?.length) {
        for (const exp of data.experience) {
          y += 6;
          els.push(`<text x="${P}" y="${y}" font-size="11" fill="${C.text}" font-family="${FONT}"><tspan font-weight="700">${esc(getText(exp.company, language))}</tspan><tspan fill="${C.sec}"> · ${esc(getText(exp.role, language))}</tspan></text>`);
          if (exp.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="10" fill="${C.muted}" font-family="${FONT}">${esc(exp.period)}</text>`);
          y += 16;
          if (exp.highlights?.length) { for (const h of exp.highlights) { els.push(`<text x="${P + 14}" y="${y}" font-size="10" fill="${C.muted}" font-family="${FONT}">• ${esc(getText(h, language))}</text>`); y += 15; } }
        }
      } else if (key === "projects" && data.projects?.length) {
        for (const proj of data.projects) {
          y += 6;
          els.push(`<text x="${P}" y="${y}" font-size="11" fill="${C.text}" font-family="${FONT}"><tspan font-weight="700">${esc(getText(proj.name, language))}</tspan>${getText(proj.role, language) ? `<tspan fill="${C.sec}"> · ${esc(getText(proj.role, language))}</tspan>` : ""}</text>`);
          if (proj.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="10" fill="${C.muted}" font-family="${FONT}">${esc(proj.period)}</text>`);
          y += 16;
          if (proj.tech?.length) { els.push(`<text x="${P}" y="${y}" font-size="10" fill="${C.muted}" font-family="${FONT}">Tech: ${esc(proj.tech.join(", "))}</text>`); y += 15; }
        }
      } else if (key === "campusActivities" && data.campusActivities?.length) {
        for (const act of data.campusActivities) {
          y += 6;
          els.push(`<text x="${P}" y="${y}" font-size="11" fill="${C.text}" font-family="${FONT}"><tspan font-weight="700">${esc(getText(act.organization, language))}</tspan><tspan fill="${C.sec}"> · ${esc(getText(act.role, language))}</tspan></text>`);
          if (act.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="10" fill="${C.muted}" font-family="${FONT}">${esc(act.period)}</text>`);
          y += 16;
          if (act.highlights?.length) { for (const h of act.highlights) { els.push(`<text x="${P + 14}" y="${y}" font-size="10" fill="${C.muted}" font-family="${FONT}">• ${esc(getText(h, language))}</text>`); y += 15; } }
        }
      } else if (key === "skills" && data.skills?.length) {
        for (const cat of data.skills) {
          y += 4;
          els.push(`<text x="${P}" y="${y}" font-size="11" fill="${C.text}" font-family="${FONT}"><tspan font-weight="700">${esc(getText(cat.category, language))}</tspan><tspan fill="${C.sec}">: ${(cat.items ?? []).join(" | ")}</tspan></text>`);
          y += 18;
        }
      }
    }
  }

  const height = Math.max(y + P, 1123);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}">
  <rect width="${W}" height="${height}" fill="white"/>
  ${els.join("\n  ")}
</svg>`;
}

function generateCompactSVG(data: ResumeData, sections: SectionKey[], emphasis: Partial<Record<SectionKey, SectionEmphasis>>, language: "zh" | "en") {
  const W = 794, P = 30;
  const CW = W - P * 2;
  const C = { text: "#1a1a1a", sec: "#4a4a4a", muted: "#888", accent: "#2563eb" };
  let y = 20;
  const els: string[] = [];

  for (const key of sections) {
    if (key === "personalInfo") {
      const info = data.personalInfo;
      const name = getText(info.name, language);
      if (!name && !info.email) continue;
      const title = getText(info.title, language);
      const headerLine = title ? `${name} | ${title}` : name;
      els.push(`<text x="${P}" y="${y}" font-size="18" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(headerLine)}</text>`);
      y += 22;
      const cs: string[] = [];
      if (info.gender) cs.push(info.gender);
      if (info.birthDate) cs.push(info.birthDate);
      if (info.politicalStatus) cs.push(info.politicalStatus);
      if (info.phone) cs.push(info.phone);
      if (info.email) cs.push(info.email);
      if (getText(info.location, language)) cs.push(getText(info.location, language));
      if (info.website) cs.push(info.website);
      if (cs.length) { els.push(`<text x="${P}" y="${y}" font-size="10" fill="${C.sec}" font-family="${FONT}">${esc(cs.join(" | "))}</text>`); y += 16; }
      const summary = getText(info.summary, language);
      if (summary) { for (const ln of wrapText(summary, CW, 10)) { els.push(`<text x="${P}" y="${y}" font-size="10" font-style="italic" fill="${C.sec}" font-family="${FONT}">${esc(ln)}</text>`); y += 15; } }
      y += 4;
    } else {
      const labelText = lbl(key as SectionKey, language);
      els.push(`<rect x="${P}" y="${y}" width="2" height="14" fill="${C.accent}"/>`);
      els.push(`<text x="${P + 8}" y="${y + 12}" font-size="11" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(labelText)}</text>`);
      y += 20;

      if (key === "education" && data.education?.length) {
        for (const edu of data.education) {
          const parts = [getText(edu.degree, language), getText(edu.major, language)].filter(Boolean);
          const school = schoolHeading(edu, language, 9, C.muted);
          els.push(`<text x="${P}" y="${y}" font-size="10.5" font-weight="700" fill="${C.text}" font-family="${FONT}">${school}${parts.length ? `${school ? " · " : ""}${esc(parts.join(" · "))}` : ""}</text>`);
          if (edu.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="10" fill="${C.muted}" font-family="${FONT}">${esc(edu.period)}</text>`);
          y += 16;
          if (edu.gpa) {
            const ds: string[] = [];
            if (edu.gpa) ds.push(`GPA: ${edu.gpa}`);
            els.push(`<text x="${P}" y="${y}" font-size="10" fill="${C.sec}" font-family="${FONT}">${esc(ds.join(" "))}</text>`);
            y += 15;
          }
          y += 2;
        }
      } else if (key === "honors" && data.honors?.length) {
        for (const h of data.honors) {
          els.push(`<text x="${P}" y="${y}" font-size="10.5" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(getText(h.title, language))}${h.level ? ` [${esc(h.level)}]` : ""}</text>`);
          if (h.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="10" fill="${C.muted}" font-family="${FONT}">${esc(h.period)}</text>`);
          y += 16;
        }
      } else if (key === "experience" && data.experience?.length) {
        for (const exp of data.experience) {
          els.push(`<text x="${P}" y="${y}" font-size="10.5" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(getText(exp.company, language))} · ${esc(getText(exp.role, language))}</text>`);
          if (exp.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="10" fill="${C.muted}" font-family="${FONT}">${esc(exp.period)}</text>`);
          y += 16;
          if (exp.highlights?.length) { for (const h of exp.highlights) { els.push(`<text x="${P + 14}" y="${y}" font-size="10.5" fill="${C.sec}" font-family="${FONT}">• ${esc(getText(h, language))}</text>`); y += 16; } }
          y += 2;
        }
      } else if (key === "projects" && data.projects?.length) {
        for (const proj of data.projects) {
          const pTitle = getText(proj.name, language) + (getText(proj.role, language) ? ` · ${getText(proj.role, language)}` : "");
          els.push(`<text x="${P}" y="${y}" font-size="10.5" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(pTitle)}</text>`);
          if (proj.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="10" fill="${C.muted}" font-family="${FONT}">${esc(proj.period)}</text>`);
          y += 16;
          if (proj.tech?.length) { els.push(`<text x="${P}" y="${y}" font-size="9.5" fill="${C.muted}" font-family="${FONT}">${language === "zh" ? "技术" : "Tech"}: ${esc(proj.tech.join(", "))}</text>`); y += 15; }
          if (getText(proj.description, language)) { for (const ln of wrapText(getText(proj.description, language), CW, 10.5)) { els.push(`<text x="${P}" y="${y}" font-size="10.5" fill="${C.sec}" font-family="${FONT}">${esc(ln)}</text>`); y += 16; } }
          y += 2;
        }
      } else if (key === "campusActivities" && data.campusActivities?.length) {
        for (const act of data.campusActivities) {
          els.push(`<text x="${P}" y="${y}" font-size="10.5" font-weight="700" fill="${C.text}" font-family="${FONT}">${esc(getText(act.organization, language))} · ${esc(getText(act.role, language))}</text>`);
          if (act.period) els.push(`<text x="${W - P}" y="${y}" text-anchor="end" font-size="10" fill="${C.muted}" font-family="${FONT}">${esc(act.period)}</text>`);
          y += 16;
          if (act.highlights?.length) { for (const h of act.highlights) { els.push(`<text x="${P + 14}" y="${y}" font-size="10.5" fill="${C.sec}" font-family="${FONT}">• ${esc(getText(h, language))}</text>`); y += 16; } }
          y += 2;
        }
      } else if (key === "skills" && data.skills?.length) {
        const parts = data.skills.map(cat => {
          const catName = getText(cat.category, language);
          return `<tspan font-weight="700">${esc(catName)}</tspan><tspan fill="${C.sec}">: ${esc((cat.items ?? []).join(", "))}</tspan>`;
        });
        els.push(`<text x="${P}" y="${y}" font-size="10.5" fill="${C.text}" font-family="${FONT}">${parts.join(`<tspan fill="${C.muted}"> | </tspan>`)}</text>`);
        y += 18;
      }
      y += 4;
    }
  }

  const height = Math.max(y + P, 1123);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}">
  <rect width="${W}" height="${height}" fill="white"/>
  ${els.join("\n  ")}
</svg>`;
}

export function downloadSVG(options: SVGExportOptions, filename: string = "resume.svg"): void {
  const svg = generateSVG(options);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
