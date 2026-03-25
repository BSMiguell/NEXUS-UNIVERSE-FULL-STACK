import { defineConfig, devices } from "@playwright/test";

const frontendPort = 3000;
const backendPort = 3101;
const frontendUrl = `http://127.0.0.1:${frontendPort}`;
const backendUrl = `http://127.0.0.1:${backendPort}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html"], ["list"]] : "list",
  timeout: 45_000,
  use: {
    baseURL: frontendUrl,
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: `powershell -Command "$env:PORT='${backendPort}'; $env:FRONTEND_ORIGIN='${frontendUrl}'; $env:NODE_ENV='test'; npm.cmd run dev"`,
      port: backendPort,
      reuseExistingServer: !process.env.CI,
      cwd: "./server",
    },
    {
      command: `powershell -Command "$env:NODE_ENV='test'; $env:NEXT_PUBLIC_API_BASE_URL='${backendUrl}'; npm.cmd run build; npm.cmd run start -- --hostname 127.0.0.1 --port ${frontendPort}"`,
      port: frontendPort,
      reuseExistingServer: !process.env.CI,
      cwd: ".",
    },
  ],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
