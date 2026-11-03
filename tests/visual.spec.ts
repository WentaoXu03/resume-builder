import { expect, test, type Page } from "@playwright/test";

const templates = ["classic", "modern", "minimal", "compact"] as const;
const languages = ["zh", "en"] as const;

const templateNames = {
  classic: /经典|Classic/i,
  modern: /现代|Modern/i,
  minimal: /简约|Minimal/i,
  compact: /紧凑|Compact/i,
} as const;

async function resetApp(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await hideNextDevTools(page);
  await expect(page.locator("#resume-preview")).toBeVisible();
}

async function hideNextDevTools(page: Page) {
  await page.addStyleTag({
    content: `
      [data-nextjs-dev-tools-button],
      [data-nextjs-dev-tools-panel],
      nextjs-portal {
        display: none !important;
      }
    `,
  });
}

async function selectTemplate(page: Page, template: (typeof templates)[number]) {
  await page.getByRole("button", { name: templateNames[template] }).click();
}

async function setLanguage(page: Page, lang: "zh" | "en") {
  const buttonName = lang === "en" ? "EN" : "中文";
  const button = page.getByRole("button", { name: buttonName, exact: true });
  if (await button.isVisible()) {
    await button.click();
  }
}

test.describe("resume visual snapshots", () => {
  for (const templateName of templates) {
    for (const language of languages) {
      test(`template ${templateName} ${language}`, async ({ page }) => {
        await resetApp(page);
        await selectTemplate(page, templateName);
        await setLanguage(page, language);

        // Wait for CSS transitions to settle completely
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`main-${templateName}-${language}.png`, {
          fullPage: true,
        });
        await expect(page.locator("#resume-preview")).toHaveScreenshot(
          `preview-${templateName}-${language}.png`,
        );
      });
    }
  }
});

test("print export opens clean export page", async ({ page, context }) => {
  await resetApp(page);

  // Mock window.print to prevent actual print dialog
  await context.addInitScript(() => {
    window.print = () => {
      (window as unknown as { __resumePrintCalled?: boolean }).__resumePrintCalled = true;
      window.dispatchEvent(new Event("resume-print-called"));
    };
  });

  // Switch to Export tab first
  await page.getByRole("button", { name: /导出|Export/i }).first().click();

  // Click main PDF export button
  const [newPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("button", { name: /一键导出 PDF|Export PDF/i }).click(),
  ]);

  // Wait for page to load
  await newPage.waitForLoadState("domcontentloaded");

  // Assert URL is /export without data= parameter
  expect(newPage.url()).toContain("/export");
  expect(newPage.url()).not.toContain("data=");

  // Assert resume preview is visible
  await expect(newPage.locator("#resume-preview")).toBeVisible();
  await expect(newPage.locator("#resume-preview")).toHaveAttribute("data-export-ready", "true");
  await expect
    .poll(() => newPage.evaluate(() => (window as unknown as { __resumePrintCalled?: boolean }).__resumePrintCalled === true))
    .toBe(true);
});

test("export page without payload shows error", async ({ page }) => {
  await page.goto("/export");

  // Should show error message
  await expect(page.getByText(/未找到导出数据|No export data/i)).toBeVisible();
});

test("hide campus activities", async ({ page }) => {
  await resetApp(page);

  // Switch to Layout tab first
  await page.getByRole("button", { name: /布局|Layout/i }).click();

  await page
    .getByRole("button", { name: /隐藏 活动经历|Hide Activities/i })
    .click();

  await page.reload();
  await hideNextDevTools(page);

  const preview = page.locator("#resume-preview");
  await expect(preview).not.toContainText("活动经历");
  await expect(preview).not.toContainText("Activities");
  await expect(preview).toHaveScreenshot("layout-hidden-campus.png");
});
