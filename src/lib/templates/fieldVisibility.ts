import type { SectionKey, TemplateName } from "@/types";

export const REQUIRED_VISIBLE_FIELDS = {
  personalInfo: ["name", "title", "gender", "birthDate", "politicalStatus", "phone", "email", "location", "website", "summary"],
  education: ["school", "schoolTier", "degree", "major", "period", "gpa", "description"],
  researchExperience: ["institution", "project", "role", "period", "description", "highlights"],
  honors: ["title", "level", "period", "description"],
  experience: ["company", "role", "period", "description", "highlights"],
  projects: ["name", "role", "period", "tech", "description", "link"],
  campusActivities: ["organization", "role", "period", "description", "highlights"],
  skills: ["category", "items"],
} as const satisfies Record<SectionKey, readonly string[]>;

export type RequiredVisibleFieldSection = keyof typeof REQUIRED_VISIBLE_FIELDS;
export type RequiredVisibleFieldTemplate = TemplateName;
