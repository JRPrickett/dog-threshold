import { expect, test } from "@playwright/test";

async function completeSetup(page: import("@playwright/test").Page, seconds = 1) {
  await page.goto("/app/");
  await page.getByLabel("Your dog's name").fill("Mabel");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /^Stays relaxed/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /^Yes/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Comfortable duration").fill(String(seconds));
  await page.getByRole("button", { name: "See my starting plan" }).click();
  await page.getByRole("button", { name: "Use this starting plan" }).click();
  await expect(page.getByRole("button", { name: "Start today's session" })).toBeVisible();
}

test("setup accepts an observed comfortable duration and converts minutes to seconds", async ({ page }) => {
  await page.goto("/app/");
  await page.getByLabel("Your dog's name").fill("Mabel");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /^Stays relaxed/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /^Yes/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  const duration = page.getByLabel("Comfortable duration");
  await duration.fill("");
  await duration.type("25");
  await expect(duration).toHaveValue("25");

  await duration.fill("1");
  await page.getByLabel("Duration unit").selectOption("minutes");
  await page.getByRole("button", { name: "See my starting plan" }).click();
  await expect(page.getByText("1 minute", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Use this starting plan" }).click();

  await expect(page.getByText("1:00")).toBeVisible();
});

test("onboarding routes cue-sensitive dogs to departure-cue practice before leaving", async ({ page }) => {
  await page.goto("/app/");
  await page.getByLabel("Your dog's name").fill("Mabel");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /^Gets watchful or follows me/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: "Start before the leaving part." })).toBeVisible();
  await expect(page.getByText("Departure cues first", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Use this starting plan" }).click();

  await expect(page.getByRole("heading", { name: "Departure cues first" })).toBeVisible();
  await page.getByRole("button", { name: "Start departure cue practice" }).click();
  await expect(
    page.getByRole("heading", { name: "Walk toward the exit, then turn away" })
  ).toBeVisible();
});

test("onboarding uses a clearly-labelled micro departure when no comfortable absence is known", async ({ page }) => {
  await page.goto("/app/");
  await page.getByLabel("Your dog's name").fill("Mabel");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /^Stays relaxed/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /^I'm not sure/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: "Start with a 1-second observation." })).toBeVisible();
  await expect(page.getByText(/conservative SettledSolo heuristic/)).toBeVisible();
  await page.getByRole("button", { name: "Use this starting plan" }).click();

  await expect(page.getByText("Starting observation", { exact: true })).toBeVisible();
  await expect(page.getByText("1s")).toBeVisible();
});

test("first session can be completed and appears in history", async ({ page }) => {
  await completeSetup(page, 1);

  await page.getByRole("button", { name: "Start today's session" }).click();
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

  await page.getByRole("button", { name: "Start today's session" }).click();
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
  await expect(page.getByRole("heading", { name: "You & Mabel" })).toBeVisible();
  await page.getByRole("button", { name: "More" }).click();

  const selector = page.getByLabel("Training track");
  await expect(selector).toHaveValue("evening");
  await selector.selectOption("morning");
  await expect(selector).toHaveValue("morning");

  await page.getByRole("button", { name: "Today" }).click();
  await expect(page.getByRole("button", { name: "Start today's session" })).toBeVisible();
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

  await expect(page.getByRole("heading", { name: "You & Ruby" })).toBeVisible();
  await expect(page.getByText("Home alone")).toBeVisible();

  await page.getByRole("button", { name: "History" }).click();
  await expect(page.getByText("Relaxed")).toBeVisible();
  await expect(page.getByText("target 7s")).toBeVisible();
});

test("a running session remains usable after the browser goes offline", async ({ page, context }) => {
  await completeSetup(page, 2);
  await page.getByRole("button", { name: "Start today's session" }).click();
  await context.setOffline(true);

  await page.getByRole("button", { name: "I'm leaving now" }).click();
  await page.waitForTimeout(1_100);
  await page.getByRole("button", { name: "I'm back" }).click();

  await expect(
    page.getByRole("heading", { name: "How was Mabel while you were away?" })
  ).toBeVisible();
  await page.getByRole("button", { name: /Relaxed/ }).click();
  await page.getByRole("button", { name: "Save session" }).click();
  await expect(page.getByRole("button", { name: "Start today's session" })).toBeVisible();
});


test("public SettledSolo site leads into the PWA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Calm starts with small steps." })).toBeVisible();
  await expect(page.getByText("SettledSolo").first()).toBeVisible();
  await page.getByRole("link", { name: "Start free" }).click();
  await expect(page).toHaveURL(/\/app\/?$/);
  await expect(page.getByLabel("Your dog's name")).toBeVisible();
});

test("iOS install help demonstrates the current Safari menu flow", async ({ page, browserName }) => {
  test.skip(browserName !== "webkit", "Safari installation help is only shown on iOS");
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto("/");
  await page.getByRole("button", { name: "Install on iPhone" }).click();

  const installDialog = page.getByRole("dialog", { name: "Keep SettledSolo one tap away." });
  await expect(installDialog).toBeVisible();
  await expect(installDialog.getByText("Three dots", { exact: true })).toBeVisible();

  const fit = await installDialog.evaluate((dialog) => {
    const bounds = dialog.getBoundingClientRect();
    return {
      top: bounds.top,
      bottom: bounds.bottom,
      viewportHeight: window.innerHeight,
      scrollHeight: dialog.scrollHeight,
      clientHeight: dialog.clientHeight
    };
  });
  expect(fit.top).toBeGreaterThanOrEqual(0);
  expect(fit.bottom).toBeLessThanOrEqual(fit.viewportHeight + 1);
  expect(fit.scrollHeight).toBeLessThanOrEqual(fit.clientHeight + 1);

  await installDialog.getByRole("button", { name: "Close installation guide" }).click();

  await completeSetup(page, 5);
  await page.getByText("Show me how").click();

  await page.getByRole("button", { name: "Tap Safari's three-dot menu" }).click();
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await page.getByRole("button", { name: "Add to Home Screen", exact: true }).click();

  await expect(page.getByText("Installed. Tap to watch again.")).toBeVisible();
});


test("a user can create and rename a separate training track", async ({ page }) => {
  await completeSetup(page, 5);
  await page.getByRole("button", { name: "More" }).click();

  await page.getByLabel("New track name").fill("School run");
  await page.getByLabel("New track starting comfort").fill("9");
  await page.getByRole("button", { name: "Add training track" }).click();

  await expect(page.getByLabel("Training track")).toHaveValue(/scenario-/);
  await expect(page.getByLabel("Track name", { exact: true })).toHaveValue("School run");

  await page.getByLabel("Track name", { exact: true }).fill("Weekday school run");
  await page.getByRole("button", { name: "Save track changes" }).click();

  await page.getByRole("button", { name: "Today" }).click();
  await expect(page.getByText("Weekday school run")).toBeVisible();
  await expect(page.getByText("9s")).toBeVisible();
});
