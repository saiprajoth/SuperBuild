import { defineConfig } from "@playwright/test";
import 'dotenv/config';
import process from "node:process";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
  },
  webServer: {
    command: "npm run dev -- --port 5173",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
