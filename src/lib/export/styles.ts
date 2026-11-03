export const FONT_STACK = "system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif";

export const SECTION_LABELS: Record<string, { zh: string; en: string }> = {
  personalInfo: { zh: "基本信息", en: "Personal Info" },
  education: { zh: "教育背景", en: "Education" },
  honors: { zh: "荣誉奖项", en: "Honors & Awards" },
  experience: { zh: "实习经历", en: "Internship" },
  projects: { zh: "项目经历", en: "Projects" },
  campusActivities: { zh: "活动经历", en: "Activities" },
  skills: { zh: "技能特长", en: "Skills" },
};

export function sectionLabel(key: string, language: "zh" | "en"): string {
  const pair = SECTION_LABELS[key];
  if (!pair) return key;
  return language === "zh" ? pair.zh : pair.en;
}

export function getText(b: { zh: string; en: string } | undefined | null, language: "zh" | "en"): string {
  if (!b) return "";
  return language === "zh" ? b.zh || b.en : b.en || b.zh;
}

export const classic = {
  text: "#1a1a1a",
  textSec: "#555555",
  textMuted: "#999999",
  line: "#333333",
  lineLight: "#d0d0d0",
  bg: "#ffffff",
  padding: "28px 36px",
  lineHeight: 1.5,
  nameSize: "22px",
  nameLetterSpacing: "1px",
  titleSize: "13px",
  sectionHeadSize: "13px",
  sectionHeadLetterSpacing: "0.5px",
  sectionHeadBorderWidth: "1.5px",
  sectionHeadBorderBottom: "8px",
  sectionHeadMarginTop: "14px",
  sectionHeadPaddingBottom: "4px",
} as const;

export const modern = {
  sidebarBg: "#2c3e50",
  sidebarText: "#ecf0f1",
  sidebarTextLight: "#bdc3c7",
  sidebarAccent: "#3498db",
  mainText: "#2c3e50",
  mainTextSecondary: "#555555",
  mainTextMuted: "#7f8c8d",
  mainBorder: "#e0e4e8",
  sectionLine: "#3498db",
  sidebarWidth: "30%",
  mainWidth: "70%",
  sidebarPadding: "24px 16px",
  mainPadding: "24px 24px 20px",
  avatarSize: "72px",
  lineHeight: 1.5,
} as const;

export const minimal = {
  text: "#1a1a1a",
  secondary: "#666666",
  muted: "#999999",
  line: "#bbbbbb",
  bg: "#ffffff",
  padding: "24px 32px",
  lineHeight: 1.5,
  sectionHeadLetterSpacing: "0.02em",
} as const;

export const compact = {
  text: "#1a1a1a",
  secondary: "#555555",
  muted: "#888888",
  accent: "#2563eb",
  bg: "#ffffff",
  padding: "22px 32px",
  lineHeight: 1.45,
} as const;