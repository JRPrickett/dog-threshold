import { expect, test } from "@playwright/test";

async function completeSetup(page: import("@playwright/test").Page, seconds = 1) {
  await page.goto("/app/");
  await page.getByLabel("Your dog's name").fill("Mabel");
  await page
    .getByLabel("A duration you already know feels comfortable")
    .fill(String(seconds));
  await page.getByRole("button", { name: "Set up your first session" }).click();
  await expect(page.getByRole("button", { name: "Start today\'s session" })).toBeVisible();
}

test("first session can be completed and appears in history", async ({ page }) => {
  await completeSetup(page, 1);

  await page.getByRole("button", { name: "Start today\'s session" }).click();
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

  await page.getByRole("button", { name: "Start today\'s session" }).click();
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

  await page.goto("/app/");
  await expect(page.getByText("Mabel")).toBeVisible();
  await page.getByRole("button", { name: "More" }).click();

  const selector = page.getByLabel("Training track");
  await expect(selector).toHaveValue("evening");
  await selector.selectOption("morning");

  await expect(page.getByRole("button", { name: "Start today\'s session" })).toBeVisible();
  await expect(page.getByText("Morning routine")).toBeVisible();
});


test("a validated backup can replace local data after confirmation", async ({ page }) => {
  await completeSetup(page, 5);
  await page.getByRole("button", { name: "More" }).click();

  const backup = {
    schemaVersion: 1,
    exportedAt: "2026-09-18T00:00:00.000Z",
    appData: {
      dogName: "Ruby",
      activeScenarioId: "training",
      scenarios: [{
        id: "training",
        label: "Home alone",
        startSeconds: 7,
        sessions: [{
          id: "restored-session",
          at: Date.UTC(2026, 8, 18, 12, 0, 0),
          targetSeconds: 7,
          actualSeconds: 7,
          outcome: "relaxed",
          stoppedEarly: false,
          signals: [],
          note: "restored"
        }]
      }]
    }
  };

  await page.getByLabel("Choose backup file").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup))
  });

  await expect(page.getByText("Ready to restore Ruby")).toBeVisible();
  await expect(page.getByText(/1 timed session/)).toBeVisible();
  await page.getByRole("button", { name: "Restore this backup" }).click();

  await expect(page.getByText("Ruby")).toBeVisible();
  await expect(page.getByText("Home alone")).toBeVisible();

  await page.getByRole("button", { name: "History" }).click();
  await expect(page.getByText("Relaxed")).toBeVisible();
  await expect(page.getByText("target 7s")).toBeVisible();
});

test("a running session remains usable after the browser goes offline", async ({ page, context }) => {
  await completeSetup(page, 2);
  await page.getByRole("button", { name: "Start today\'s session" }).click();
  await context.setOffline(true);

  await page.getByRole("button", { name: "I'm leaving now" }).click();
  await page.waitForTimeout(1_100);
  await page.getByRole("button", { name: "I'm back" }).click();

  await expect(
    page.getByRole("heading", { name: "How was Mabel while you were away?" })
  ).toBeVisible();
  await page.getByRole("button", { name: /Relaxed/ }).click();
  await page.getByRole("button", { name: "Save session" }).click();
  await expect(page.getByRole("button", { name: "Start today\'s session" })).toBeVisible();
});


test("public SettledSolo site leads into the PWA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Calm starts with small steps." })).toBeVisible();
  await expect(page.getByText("SettledSolo").first()).toBeVisible();
  await page.getByRole("link", { name: "Start training free" }).click();
  await expect(page).toHaveURL(/\/app\/?$/);
  await expect(page.getByLabel("Your dog's name")).toBeVisible();
});


test("a user can create and rename a separate training track", async ({ page }) => {
  await completeSetup(page, 5);
  await page.getByRole("button", { name: "More" }).click();

  await page.getByLabel("New track name").fill("School run");
  await page.getByLabel("New track starting comfort").fill("9");
  await page.getByRole("button", { name: "Add training track" }).click();

  await expect(page.getByLabel("Training track")).toHaveValue(/scenario-/);
  await expect(page.getByDisplayValue("School run")).toBeVisible();

  await page.getByLabel("Track name").fill("Weekday school run");
  await page.getByRole("button", { name: "Save track changes" }).click();

  await page.getByRole("button", { name: "Today" }).click();
  await expect(page.getByText("Weekday school run")).toBeVisible();
  await expect(page.getByText("9s")).toBeVisible();
});
