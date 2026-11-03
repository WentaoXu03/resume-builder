export interface BilingualText {
  zh: string;
  en: string;
}

export interface PersonalInfo {
  name: BilingualText;
  title: BilingualText;
  email: string;
  phone: string;
  location: BilingualText;
  website: string;
  summary: BilingualText;
  avatarUrl: string;
  gender: string;
  birthDate: string;
  politicalStatus: string;
}

export interface Experience {
  id: string;
  company: BilingualText;
  role: BilingualText;
  period: string;
  description: BilingualText;
  highlights: BilingualText[];
}

export interface Project {
  id: string;
  name: BilingualText;
  role: BilingualText;
  tech: string[];
  period: string;
  description: BilingualText;
  highlights: BilingualText[];
  link: string;
}

export interface SkillCategory {
  id: string;
  category: BilingualText;
  items: string[];
}

export type SchoolTier = '985' | '211';

export function normalizeSchoolTier(value: unknown): SchoolTier | undefined {
  return value === '985' || value === '211' ? value : undefined;
}

export interface Education {
  id: string;
  school: BilingualText;
  schoolTier?: SchoolTier;
  degree: BilingualText;
  major: BilingualText;
  period: string;
  gpa: string;
  description: BilingualText;
}

export interface Honor {
  id: string;
  title: BilingualText;
  level: string;
  period: string;
  description: BilingualText;
}

export interface CampusActivity {
  id: string;
  organization: BilingualText;
  role: BilingualText;
  period: string;
  description: BilingualText;
  highlights: BilingualText[];
}

export interface ResearchExperience {
  id: string;
  institution: BilingualText;
  project: BilingualText;
  role: BilingualText;
  period: string;
  description: BilingualText;
  highlights: BilingualText[];
}

export type SectionKey = 'personalInfo' | 'education' | 'researchExperience' | 'honors' | 'experience' | 'projects' | 'campusActivities' | 'skills';

export type SectionEmphasis = 'expanded' | 'normal' | 'compact' | 'hidden';

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  honors: Honor[];
  experience: Experience[];
  projects: Project[];
  campusActivities: CampusActivity[];
  researchExperience: ResearchExperience[];
  skills: SkillCategory[];
}

export interface LayoutSuggestion {
  template: TemplateName;
  sectionOrder: SectionKey[];
  emphasis: Partial<Record<SectionKey, SectionEmphasis>>;
  language: 'zh' | 'en';
}

export type TemplateName = 'classic' | 'modern' | 'minimal' | 'compact';

export const TEMPLATE_NAMES: Record<TemplateName, BilingualText> = {
  classic: { zh: '经典', en: 'Classic' },
  modern: { zh: '现代', en: 'Modern' },
  minimal: { zh: '简约', en: 'Minimal' },
  compact: { zh: '紧凑', en: 'Compact' },
};

export type AccentColor = 'obsidian' | 'navy' | 'charcoal' | 'forest' | 'burgundy';

export const DEFAULT_ACCENT_COLOR: AccentColor = 'obsidian';

export const ACCENT_COLOR_OPTIONS: {
  key: AccentColor;
  swatch: string;
  label: BilingualText;
}[] = [
  { key: 'obsidian', swatch: '#18181b', label: { zh: '曜石黑', en: 'Obsidian' } },
  { key: 'navy', swatch: '#1e3a5f', label: { zh: '深海蓝', en: 'Oxford Navy' } },
  { key: 'charcoal', swatch: '#334155', label: { zh: '钛灰墨', en: 'Graphite' } },
  { key: 'forest', swatch: '#1b4332', label: { zh: '松烟绿', en: 'Pine Green' } },
  { key: 'burgundy', swatch: '#5c1d24', label: { zh: '勃艮第', en: 'Burgundy' } },
];

export function normalizeAccentColor(value?: unknown): AccentColor {
  if (
    value === 'obsidian' ||
    value === 'navy' ||
    value === 'charcoal' ||
    value === 'forest' ||
    value === 'burgundy'
  ) {
    return value;
  }
  return DEFAULT_ACCENT_COLOR;
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    name: { zh: '', en: '' },
    title: { zh: '', en: '' },
    email: '',
    phone: '',
    location: { zh: '', en: '' },
    website: '',
    summary: { zh: '', en: '' },
    avatarUrl: '',
    gender: '',
    birthDate: '',
    politicalStatus: '',
  },
  education: [],
  honors: [],
  experience: [],
  projects: [],
  campusActivities: [],
  researchExperience: [],
  skills: [],
};

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'personalInfo',
  'education',
  'researchExperience',
  'honors',
  'experience',
  'projects',
  'campusActivities',
  'skills',
];

export const SECTION_LABELS: Record<SectionKey, BilingualText> = {
  personalInfo: { zh: '基本信息', en: 'Personal Info' },
  education: { zh: '教育背景', en: 'Education' },
  researchExperience: { zh: '科研经历', en: 'Research Experience' },
  honors: { zh: '荣誉奖项', en: 'Honors & Awards' },
  experience: { zh: '实习经历', en: 'Internship' },
  projects: { zh: '项目经历', en: 'Projects' },
  campusActivities: { zh: '活动经历', en: 'Activities' },
  skills: { zh: '技能特长', en: 'Skills' },
};

export const DEFAULT_FONT_SCALE = 1;
export const MIN_FONT_SCALE = 0.85;
export const MAX_FONT_SCALE = 1.25;
export const FONT_SCALE_STEP = 0.05;

export function clampFontScale(scale?: unknown): number {
  if (typeof scale !== 'number' || !Number.isFinite(scale)) return DEFAULT_FONT_SCALE;
  const clamped = Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, scale));
  return Math.round(clamped * 100) / 100;
}
