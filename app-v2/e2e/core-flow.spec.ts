import { expect, test } from "@playwright/test";

async function completeSetup(page: import("@playwright/test").Page, seconds = 1) {
  await page.goto("/");
  await page.getByLabel("Your dog's name").fill("Mabel");
  await page
    .getByLabel("A duration you already know feels comfortable")
    .fill(String(seconds));
  await page.getByRole("button", { name: "Set up today's training" }).click();
  await expect(page.getByRole("button", { name: "Start session" })).toBeVisible();
}

test("first session can be completed and appears in history", async ({ page }) => {
  await completeSetup(page, 1);

  await page.getByRole("button", { name: "Start session" }).click();
  await expect(page.getByText("Today's main departure")).toBeVisible();

  await page.getByRole("button", { name: "I'm leaving now" }).click();
  await page.waitForTimeout(1_100);
  await page.getByRole("button", { name: "I'm back" }).click();

  await expect(page.getByRole("heading", { name: "How was Mabel while you were away?" })).toBeVisible();
  await page.getByRole("button", { name: /Relaxed/ }).click();
  await page.getByRole("button", { name: "Save session" }).click();

  await page.getByRole("button", { name: "History" }).click();
  await expect(page.getByText("Relaxed")).toBeVisible();
  await expect(page.getByText("target 1s")).toBeVisible();
});

test("a running session survives a reload and keeps its original timer", async ({ page }) => {
  await completeSetup(page, 5);

  await page.getByRole("button", { name: "Start session" }).click();
  await page.getByRole("button", { name: "I'm leaving now" }).click();
  await page.waitForTimeout(600);

  await page.reload();

  await expect(page.getByRole("button", { name: "I'm back" })).toBeVisible();
  await expect(page.getByText(/away · target 5s/)).toBeVisible();
});

test("departure cue practice only advances after repeated calm sets", async ({ page }) => {
  await completeSetup(page, 5);

  await page.getByRole("button", { name: "Departure cue practice" }).click();
  await expect(
    page.getByRole("heading", { name: "Walk toward the exit, then turn away" })
  ).toBeVisible();

  for (let rep = 0; rep < 3; rep += 1) {
    await page.getByRole("button", { name: /Relaxed/ }).click();
  }
  await page.getByRole("button", { name: "Save cue practice" }).click();

  await page.getByRole("button", { name: "Departure cue practice" }).click();
  await expect(
    page.getByRole("heading", { name: "Walk toward the exit, then turn away" })
  ).toBeVisible();

  for (let rep = 0; rep < 3; rep += 1) {
    await page.getByRole("button", { name: /Relaxed/ }).click();
  }
  await page.getByRole("button", { name: "Save cue practice" }).click();

  await page.getByRole("button", { name: "Departure cue practice" }).click();
  await expect(
    page.getByRole("heading", { name: "Stand near the exit for a moment, then move away" })
  ).toBeVisible();
});


test("legacy users keep multiple training tracks after migration", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "threshold.v2",
      JSON.stringify({
        version: 5,
        name: "Mabel",
        active: "evening",
        setupDone: true,
        scenarios: [
          {
            id: "morning",
            label: "Morning routine",
            start: 5,
            sessions: []
          },
          {
            id: "evening",
            label: "Evening routine",
            start: 12,
            sessions: []
          }
        ]
      })
    );
  });

  await page.goto("/");
  await expect(page.getByText("Mabel")).toBeVisible();
  await page.getByRole("button", { name: "More" }).click();

  const selector = page.getByLabel("Training track");
  await expect(selector).toHaveValue("evening");
  await selector.selectOption("morning");

  await expect(page.getByRole("button", { name: "Start session" })).toBeVisible();
  await expect(page.getByText("Morning routine")).toBeVisible();
});
