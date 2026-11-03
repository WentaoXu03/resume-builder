import type { ResumeData } from "@/types";
import { DEFAULT_RESUME_DATA, normalizeSchoolTier } from "@/types";

export function exportToJSON(data: ResumeData): string {
  return JSON.stringify(data, null, 2);
}

function mergeWithDefaults(data: Partial<ResumeData>): ResumeData {
  const defaults = DEFAULT_RESUME_DATA;
  return {
    personalInfo: { ...defaults.personalInfo, ...data.personalInfo },
    education: Array.isArray(data.education) ? data.education.map((edu) => ({
      ...defaults.education[0],
      id: edu.id || "",
      school: edu.school || { zh: "", en: "" },
      schoolTier: normalizeSchoolTier(edu.schoolTier),
      degree: edu.degree || { zh: "", en: "" },
      major: edu.major || { zh: "", en: "" },
      period: edu.period || "",
      gpa: edu.gpa || "",
      description: edu.description || { zh: "", en: "" },
    })) : [],
    honors: Array.isArray(data.honors) ? data.honors.map((h) => ({
      id: h.id || "",
      title: h.title || { zh: "", en: "" },
      level: h.level || "",
      period: h.period || "",
      description: h.description || { zh: "", en: "" },
    })) : [],
    experience: Array.isArray(data.experience) ? data.experience.map((exp) => ({
      ...defaults.experience[0],
      id: exp.id || "",
      company: exp.company || { zh: "", en: "" },
      role: exp.role || { zh: "", en: "" },
      period: exp.period || "",
      description: exp.description || { zh: "", en: "" },
      highlights: exp.highlights || [],
    })) : [],
    projects: Array.isArray(data.projects) ? data.projects.map((proj) => ({
      ...defaults.projects[0],
      id: proj.id || "",
      name: proj.name || { zh: "", en: "" },
      role: proj.role || { zh: "", en: "" },
      tech: proj.tech || [],
      period: proj.period || "",
      description: proj.description || { zh: "", en: "" },
      highlights: proj.highlights || [],
      link: proj.link || "",
    })) : [],
    campusActivities: Array.isArray(data.campusActivities) ? data.campusActivities.map((act) => ({
      id: act.id || "",
      organization: act.organization || { zh: "", en: "" },
      role: act.role || { zh: "", en: "" },
      period: act.period || "",
      description: act.description || { zh: "", en: "" },
      highlights: act.highlights || [],
    })) : [],
    skills: Array.isArray(data.skills) ? data.skills.map((cat) => ({
      id: cat.id || "",
      category: cat.category || { zh: "", en: "" },
      items: cat.items || [],
    })) : [],
    researchExperience: Array.isArray(data.researchExperience) ? data.researchExperience.map((r) => ({
      id: r.id || "",
      institution: r.institution || { zh: "", en: "" },
      project: r.project || { zh: "", en: "" },
      role: r.role || { zh: "", en: "" },
      period: r.period || "",
      description: r.description || { zh: "", en: "" },
      highlights: r.highlights || [],
    })) : [],
  };
}

export function importFromJSON(jsonString: string): ResumeData | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed === "object" && parsed.personalInfo) {
      return mergeWithDefaults(parsed as Partial<ResumeData>);
    }
    return null;
  } catch {
    return null;
  }
}

export function downloadJSON(data: ResumeData, filename: string = "resume.json"): void {
  const json = exportToJSON(data);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
