const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/blackbox.spec.js",

  testIgnore: ["**/whitebox.spec.js"],

  timeout: 30000,
  fullyParallel: false,
  workers: 1,

  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    headless: false,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
