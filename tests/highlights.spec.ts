import { expect, test } from "@playwright/test";
import { generateSVG } from "../src/lib/export/svg";
import { DEFAULT_RESUME_DATA, DEFAULT_SECTION_ORDER, type ResumeData } from "../src/types/resume";

const templates = ["classic", "modern", "minimal", "compact"] as const;
const languages = ["zh", "en"] as const;
const templateLabels = { classic: "经典", modern: "现代", minimal: "简约", compact: "紧凑" };
const sections = ["researchExperience", "experience", "projects", "campusActivities"] as const;
const bilingual = (text: string) => ({ zh: `${text}中文`, en: `${text} English` });
const highlights = (section: string) => Array.from({ length: 5 }, (_, index) => bilingual(`${section}-point-${index + 1}`));

function resumeWithFiveHighlights(): ResumeData {
  return {
    ...structuredClone(DEFAULT_RESUME_DATA),
    personalInfo: { ...DEFAULT_RESUME_DATA.personalInfo, name: bilingual("Highlight test") },
    researchExperience: [{ id: "research", institution: bilingual("Lab"), project: bilingual("Study"), role: bilingual("Researcher"), period: "2025", description: bilingual("Research"), highlights: highlights("researchExperience") }],
    experience: [{ id: "experience", company: bilingual("Company"), role: bilingual("Engineer"), period: "2025", description: bilingual("Work"), highlights: highlights("experience") }],
    projects: [{ id: "project", name: bilingual("Project"), role: bilingual("Developer"), period: "2025", description: bilingual("Project description"), tech: [], link: "", highlights: highlights("projects") }],
    campusActivities: [{ id: "campus", organization: bilingual("Club"), role: bilingual("Organizer"), period: "2025", description: bilingual("Activity"), highlights: highlights("campusActivities") }],
  };
}

for (const template of templates) {
  for (const language of languages) {
    test(`${template} ${language} highlights stay visible in preview and print`, async ({ page, context }) => {
      const data = resumeWithFiveHighlights();
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await context.addInitScript(() => { window.print = () => {}; });
      await page.goto("/");
      await page.getByRole("button", { name: /导出|Export/i }).first().click();
      await page.locator('input[type="file"]').setInputFiles({
        name: "highlights.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(data)),
      });
      await expect(page.getByText(/导入成功|Import successful/i)).toBeVisible();
      await page.getByRole("button", { name: templateLabels[template], exact: true }).click();
      if (language === "en") await page.getByRole("button", { name: "EN", exact: true }).click();

      const preview = page.locator("#resume-preview");
      for (const section of sections) {
        for (const highlight of data[section][0].highlights) await expect(preview).toContainText(highlight[language]);
      }
      await expect(preview.locator("li")).toHaveCount(20);

      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        page.getByRole("button", { name: /一键导出 PDF|Export PDF/i }).click(),
      ]);
      const printed = popup.locator("#resume-preview");
      await expect(printed).toHaveAttribute("data-export-ready", "true");
      await popup.emulateMedia({ media: "print" });
      for (const section of sections) {
        for (const highlight of data[section][0].highlights) await expect(printed).toContainText(highlight[language]);
      }
      await expect(printed.locator("li")).toHaveCount(20);
      expect(errors).toEqual([]);
      await popup.close();
    });

    test(`${template} ${language} SVG keeps all experience and campus highlights`, () => {
      const data = resumeWithFiveHighlights();
      const svg = generateSVG({ data, template, language, sectionOrder: DEFAULT_SECTION_ORDER, emphasis: {} });
      for (const section of ["experience", "campusActivities"] as const) {
        for (const highlight of data[section][0].highlights) expect(svg).toContain(highlight[language]);
      }
    });
  }
}
