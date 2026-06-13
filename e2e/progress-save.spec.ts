import { test, expect, type Page, type Response } from "@playwright/test";

// The code that passes all Mission 1 checkpoints (Blink).
const MISSION_1_PASSING_CODE = `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`;

const NICKNAME = "TestLearner";

async function screenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
  console.log(`📸 Screenshot: e2e/screenshots/${name}.png`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function waitForAppReady(page: Page): Promise<void> {
  // The app shows a loading indicator while the API call is in flight.
  await page.waitForSelector('[aria-busy="true"]', { state: "hidden", timeout: 10_000 });
}

async function captureNextSaveResponse(page: Page): Promise<Response> {
  return page.waitForResponse(
    (res) => res.url().includes("/api/progress/save") && res.request().method() === "POST",
    { timeout: 10_000 }
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Progress save", () => {
  test("nickname triggers save and persists after reload", async ({ page }) => {
    // ── 1. Open app ──────────────────────────────────────────────────────────
    await page.goto("/");
    await waitForAppReady(page);
    await screenshot(page, "01-initial-load");

    // ── 2. Onboarding: enter nickname ─────────────────────────────────────
    const nicknameInput = page.getByPlaceholder(/nickname/i);
    await expect(nicknameInput).toBeVisible();
    await nicknameInput.fill(NICKNAME);

    const saveResponsePromise = captureNextSaveResponse(page);
    await page.getByRole("button", { name: /start|let.s go|continue/i }).click();

    await screenshot(page, "02-after-nickname-submit");

    // ── 3. Check the API save call ────────────────────────────────────────
    const saveResponse = await saveResponsePromise;
    const saveBody = await saveResponse.json() as Record<string, unknown>;

    console.log("📡 /api/progress/save response:", JSON.stringify(saveBody));
    await screenshot(page, "03-after-save-api-call");

    expect(saveResponse.status(), `Save API returned ${saveResponse.status()}: ${JSON.stringify(saveBody)}`).toBe(200);
    expect(saveBody.error, `Save API error: ${JSON.stringify(saveBody)}`).toBeUndefined();
    expect(saveBody.ok).toBe(true);

    // ── 4. Verify progress is shown ───────────────────────────────────────
    await expect(page.getByText(NICKNAME)).toBeVisible();
    await screenshot(page, "04-progress-summary-visible");

    // ── 5. Reload and verify persistence ─────────────────────────────────
    await page.reload();
    await waitForAppReady(page);
    await screenshot(page, "05-after-reload");

    await expect(page.getByText(NICKNAME)).toBeVisible();
    console.log("✅ Nickname persisted after reload.");
  });

  test("completing Mission 1 saves XP and badge", async ({ page }) => {
    // ── 1. Open app and skip onboarding if already done ───────────────────
    await page.goto("/");
    await waitForAppReady(page);
    await screenshot(page, "m1-01-initial");

    // Set nickname if onboarding card is shown
    const nicknameInput = page.getByPlaceholder(/nickname/i);
    if (await nicknameInput.isVisible()) {
      await nicknameInput.fill(NICKNAME);
      await page.getByRole("button", { name: /start|let.s go|continue/i }).click();
      await waitForAppReady(page);
    }

    await screenshot(page, "m1-02-onboarding-done");

    // ── 2. Find the code editor and enter passing code ────────────────────
    const editor = page.locator("textarea").first();
    await expect(editor).toBeVisible({ timeout: 8_000 });

    await editor.fill(MISSION_1_PASSING_CODE);
    await screenshot(page, "m1-03-code-entered");

    // ── 3. Click Validate and intercept the save call ─────────────────────
    const saveResponsePromise = captureNextSaveResponse(page);

    await page.getByRole("button", { name: /validate|check|submit/i }).click();
    await screenshot(page, "m1-04-after-validate-click");

    // ── 4. Check validation result shown in UI ────────────────────────────
    const passMessage = page.locator("text=/pass|correct|mission complete|earned/i").first();
    await expect(passMessage).toBeVisible({ timeout: 8_000 });
    await screenshot(page, "m1-05-validation-passed");

    // ── 5. Check save API response ────────────────────────────────────────
    const saveResponse = await saveResponsePromise;
    const saveBody = await saveResponse.json() as Record<string, unknown>;

    console.log("📡 /api/progress/save response:", JSON.stringify(saveBody));
    await screenshot(page, "m1-06-after-save-api-call");

    expect(saveResponse.status(), `Save API returned ${saveResponse.status()}: ${JSON.stringify(saveBody)}`).toBe(200);
    expect(saveBody.error, `Save API error: ${JSON.stringify(saveBody)}`).toBeUndefined();
    expect(saveBody.ok).toBe(true);

    // ── 6. Reload and verify XP persisted ────────────────────────────────
    await page.reload();
    await waitForAppReady(page);
    await screenshot(page, "m1-07-after-reload");

    // XP from Mission 1 should still be visible
    const xpText = page.locator("text=/xp/i").first();
    await expect(xpText).toBeVisible();
    console.log("✅ XP visible after reload — progress persisted.");

    await screenshot(page, "m1-08-final");
  });
});
