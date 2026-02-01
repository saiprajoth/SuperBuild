import { test, expect } from "@playwright/test";

test("drop -> select -> delete -> undo restores", async ({ page }) => {
  await page.goto("/");

  const canvas = page.getByTestId("canvas-root");
  await expect(canvas).toBeVisible();

  const bar = page.locator('[aria-label="component-bar"]');
  await expect(bar).toBeVisible();

  // drag "Text" palette item to canvas
  const textItem = bar.locator("text=Text").first();
  await textItem.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });

  // element exists
  const els = page.getByTestId("canvas-element");
  await expect(els).toHaveCount(1);

  // click select
  await els.first().click();

  // delete
  await page.keyboard.press("Delete");
  await expect(els).toHaveCount(0);

  // undo (CI runs on linux => ctrl+z)
  await page.keyboard.press("Control+z");
  await expect(els).toHaveCount(1);
});
