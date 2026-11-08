const { test: base, expect, chromium } = require("@playwright/test");
const path = require("path");
const extensionPath = path.resolve(__dirname, "..");
const test = base.extend({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let serviceWorker = context.serviceWorkers()[0];
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent("serviceworker");
    }
    const extensionId = new URL(serviceWorker.url()).host;
    await use(extensionId);
  },
  extensionPage: async ({ context, extensionId }, use) => {
    const page = await context.newPage();
    await page.goto(
      `chrome-extension://${extensionId}/sidepanel/sidepanel.html`,
    );
    await use(page);
    await page.close();
  },
});
module.exports = { test, expect };
