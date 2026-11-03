import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import { DEMO_RESUME_DATA } from "../src/lib/demoData";
import { exportToJSON, importFromJSON } from "../src/lib/export/json";
import { generateSVG } from "../src/lib/export/svg";
import { DEFAULT_SECTION_ORDER } from "../src/types/resume";

const templates = ["classic", "modern", "minimal", "compact"] as const;
const labels = { classic: "经典", modern: "现代", minimal: "简约", compact: "紧凑" };
const taggedResume = () => ({
  ...structuredClone(DEMO_RESUME_DATA),
  education: ["985", "211"].map((tier, index) => ({
    ...structuredClone(DEMO_RESUME_DATA.education[0]),
    id: `school-${index}`,
    school: { zh: `示例大学${index + 1}`, en: `Example University ${index + 1}` },
    schoolTier: tier as "985" | "211",
  })),
});

test("older JSON imports without assigning school designations", () => {
  const data = importFromJSON(JSON.stringify(DEMO_RESUME_DATA));
  expect(data?.education.every((item) => item.schoolTier === undefined)).toBe(true);
  expect(data?.education.map((item) => item.school)).toEqual(DEMO_RESUME_DATA.education.map((item) => item.school));
});

test("JSON round trips retain valid tiers and discard unsupported designations", () => {
  const data = taggedResume();
  expect(importFromJSON(exportToJSON(data))?.education.map((item) => item.schoolTier)).toEqual(["985", "211"]);
  for (const value of ["", "other", 985, null, { zh: "985" }]) {
    const invalid = { ...data, education: [{ ...data.education[0], schoolTier: value }] };
    expect(importFromJSON(JSON.stringify(invalid))?.education[0].schoolTier).toBeUndefined();
  }
});

test("school tier can be selected, persisted, exported, changed and cleared", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /ED 教育背景/ }).click();
  const selection = page.getByLabel("院校标记（可选）").first();
  const marker = page.locator("#resume-preview [data-school-tier]");
  await expect(selection).toHaveValue("");
  await expect(marker).toHaveCount(0);
  await selection.selectOption("985");
  await expect(marker).toHaveText("985");
  await page.reload();
  await expect(marker).toHaveText("985");
  await page.getByRole("button", { name: /04 导出/ }).click();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON", exact: true }).click();
  const file = await downloading;
  const exported = JSON.parse(await fs.readFile((await file.path())!, "utf8"));
  expect(exported.education[0].schoolTier).toBe("985");
  await page.getByRole("button", { name: /01 编辑/ }).click();
  await selection.selectOption("211");
  await expect(marker).toHaveText("211");
  await selection.selectOption("");
  await expect(marker).toHaveCount(0);
  await page.reload();
  await expect(marker).toHaveCount(0);
});

for (const template of templates) {
  for (const language of ["zh", "en"] as const) {
    test(`${template} ${language} school tags are subtle, scalable and retained in print`, async ({ page, context }) => {
      const data = taggedResume();
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await context.addInitScript(() => { window.print = () => {}; });
      await page.goto("/");
      await page.getByRole("button", { name: /04 导出/ }).click();
      await page.locator('input[type="file"]').setInputFiles({ name: "schools.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(data)) });
      await expect(page.getByText("导入成功", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: labels[template], exact: true }).click();
      if (language === "en") await page.getByRole("button", { name: "EN", exact: true }).click();
      const preview = page.locator("#resume-preview");
      const markers = preview.locator("[data-school-tier]");
      await expect(markers).toHaveText(["985", "211"]);

      for (const scale of [0.85, 1, 1.25]) {
        await page.locator(".font-scale-value").click();
        for (let step = 0; step < Math.round(Math.abs(scale - 1) / 0.05); step++) {
          await page.getByRole("button", { name: scale < 1 ? /缩小字号|Decrease font size/ : /放大字号|Increase font size/ }).click();
        }
        await expect(preview).toHaveAttribute("data-font-scale", String(scale));
        for (let index = 0; index < 2; index++) {
          const metrics = await markers.nth(index).evaluate((node) => {
            const style = getComputedStyle(node);
            const school = node.previousElementSibling!;
            const schoolStyle = getComputedStyle(school);
            return { text: school.textContent, fontSize: parseFloat(style.fontSize), schoolFontSize: parseFloat(schoolStyle.fontSize), color: style.color, schoolColor: schoolStyle.color, weight: style.fontWeight, border: style.borderTopWidth, background: style.backgroundColor, marginLeft: parseFloat(style.marginLeft) };
          });
          expect(metrics.text).toBe(data.education[index].school[language]);
          expect(metrics.fontSize).toBeCloseTo(10 * scale, 2);
          expect(metrics.fontSize).toBeLessThan(metrics.schoolFontSize);
          expect(metrics.color).not.toBe(metrics.schoolColor);
          expect(metrics.weight).toBe("600");
          expect(metrics.border).toBe("0px");
          expect(metrics.background).toBe("rgba(0, 0, 0, 0)");
          expect(metrics.marginLeft).toBeCloseTo(5 * scale, 2);
        }
      }
      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        page.getByRole("button", { name: /一键导出 PDF|Export PDF/i }).click(),
      ]);
      const printed = popup.locator("#resume-preview");
      await expect(printed).toHaveAttribute("data-export-ready", "true");
      await expect(printed).toHaveAttribute("data-font-scale", "1.25");
      await popup.emulateMedia({ media: "print" });
      await expect(printed.locator("[data-school-tier]")).toHaveText(["985", "211"]);
      await expect(printed.locator("[data-school-tier]").first()).toHaveCSS("font-size", "12.5px");
      expect(errors).toEqual([]);
      await popup.close();
    });

    test(`${template} ${language} SVG retains selected school designations only`, () => {
      const options = { template, language, sectionOrder: DEFAULT_SECTION_ORDER, emphasis: {} };
      const svg = generateSVG({ ...options, data: taggedResume() });
      expect(svg).toMatch(/data-school-tier="985"[^>]*font-weight="600"/);
      expect(svg).toMatch(/data-school-tier="211"[^>]*font-weight="600"/);
      expect(generateSVG({ ...options, data: DEMO_RESUME_DATA })).not.toContain("data-school-tier=");
    });
  }
}
