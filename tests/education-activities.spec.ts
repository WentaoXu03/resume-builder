import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import { DEMO_RESUME_DATA } from "../src/lib/demoData";
import { importFromJSON } from "../src/lib/export/json";
import { generateSVG } from "../src/lib/export/svg";
import { DEFAULT_SECTION_ORDER } from "../src/types/resume";

const templates = ["classic", "modern", "minimal", "compact"] as const;
const templateLabels = { classic: "经典", modern: "现代", minimal: "简约", compact: "紧凑" };
const courseMarker = "LEGACY_COURSE_SHOULD_NOT_APPEAR";
const legacyResume = () => ({
  ...structuredClone(DEMO_RESUME_DATA),
  education: DEMO_RESUME_DATA.education.map((item) => ({ ...structuredClone(item), courses: [courseMarker] })),
});

test("legacy JSON keeps education and activity data while dropping removed courses", () => {
  const old = legacyResume();
  const imported = importFromJSON(JSON.stringify(old));
  expect(imported).not.toBeNull();
  expect(imported?.education).toEqual(DEMO_RESUME_DATA.education);
  expect(imported?.campusActivities).toEqual(old.campusActivities);
  expect(imported?.education.every((item) => !("courses" in item))).toBe(true);
});

test("persisted legacy resumes load without courses and keep their activities", async ({ page }) => {
  const data = legacyResume();
  await page.addInitScript((resume) => {
    localStorage.setItem("resume-builder-data", JSON.stringify({ state: { data: resume, markdownBoldMigrated: true }, version: 0 }));
  }, data);
  await page.goto("/");
  await expect(page.locator("#resume-preview")).toContainText(data.personalInfo.name.zh);
  await page.getByRole("button", { name: /ED 教育背景/ }).click();
  await expect(page.getByText("主修课程", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /04 导出/ }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON", exact: true }).click();
  const exportedFile = await download;
  const exported = JSON.parse(await fs.readFile((await exportedFile.path())!, "utf8"));
  expect(exported.education.every((item: Record<string, unknown>) => !("courses" in item))).toBe(true);
  expect(exported.campusActivities).toEqual(data.campusActivities);
});

for (const template of templates) {
  for (const language of ["zh", "en"] as const) {
    const heading = language === "zh" ? "活动经历" : "Activities";
    const oldHeading = language === "zh" ? "校园经历" : "Campus Activities";

    test(`${template} ${language} editor, preview and print use activities without coursework`, async ({ page, context }) => {
      const data = legacyResume();
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await context.addInitScript(() => { window.print = () => {}; });
      await page.goto("/");
      await page.getByRole("button", { name: /04 导出/ }).click();
      await page.locator('input[type="file"]').setInputFiles({ name: "legacy.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(data)) });
      await expect(page.getByText("导入成功", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: /01 编辑/ }).click();
      await page.getByRole("button", { name: /ED 教育背景/ }).click();
      await expect(page.getByText("主修课程", { exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /CA 活动经历/ })).toBeVisible();
      await page.getByRole("button", { name: templateLabels[template], exact: true }).click();
      if (language === "en") await page.getByRole("button", { name: "EN", exact: true }).click();

      const preview = page.locator("#resume-preview");
      await expect(preview.getByText(heading, { exact: true })).toBeVisible();
      await expect(preview).not.toContainText(oldHeading);
      await expect(preview).not.toContainText(courseMarker);
      await expect(preview).toContainText(data.education[0].school[language]);
      await expect(preview).toContainText(data.education[0].gpa.replace(/\*\*/g, ""));

      await page.getByRole("button", { name: /导出|Export/i }).first().click();
      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        page.getByRole("button", { name: /一键导出 PDF|Export PDF/i }).click(),
      ]);
      const printed = popup.locator("#resume-preview");
      await expect(printed).toHaveAttribute("data-export-ready", "true");
      await popup.emulateMedia({ media: "print" });
      await expect(printed.getByText(heading, { exact: true })).toBeVisible();
      await expect(printed).not.toContainText(oldHeading);
      await expect(printed).not.toContainText(courseMarker);
      expect(errors).toEqual([]);
      await popup.close();
    });

    test(`${template} ${language} SVG removes legacy courses and uses the new activity heading`, () => {
      const svg = generateSVG({ data: legacyResume(), template, language, sectionOrder: DEFAULT_SECTION_ORDER, emphasis: {} });
      expect(svg).not.toContain(courseMarker);
      expect(svg).not.toContain(oldHeading);
      expect(svg).toContain(heading);
      expect(svg).toContain("GPA");
    });
  }
}
