import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function expectNoSeriousViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const blocking = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );

  expect(
    blocking,
    blocking
      .map(
        (violation) =>
          `${violation.id}: ${violation.help}\n${violation.nodes
            .map((node) => `  ${node.target.join(" ")} — ${node.failureSummary ?? ""}`)
            .join("\n")}`
      )
      .join("\n\n")
  ).toEqual([]);
}

test("public homepage has no serious WCAG A/AA violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Calm starts with small steps." })).toBeVisible();
  await expectNoSeriousViolations(page);
});

test("first-run app shell has no serious WCAG A/AA violations", async ({ page }) => {
  await page.goto("/app/");
  await expect(page.getByLabel("Your dog's name")).toBeVisible();
  await expectNoSeriousViolations(page);
});


test("guided onboarding remains accessible through routing and plan review", async ({ page }) => {
  await page.goto("/app/");
  await page.getByLabel("Your dog's name").fill("Mabel");
  await page.getByRole("button", { name: "Continue" }).click();
  await expectNoSeriousViolations(page);

  await page.getByRole("button", { name: /^Stays relaxed/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expectNoSeriousViolations(page);

  await page.getByRole("button", { name: /^I'm not sure/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Start with a 3-second observation." })).toBeVisible();
  await expectNoSeriousViolations(page);
});
