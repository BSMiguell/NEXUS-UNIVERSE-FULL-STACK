import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

test("redireciona visitante para login ao abrir favoritos", async ({ page }) => {
  await page.goto("/favoritos");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Email")).toBeVisible();
});

test("redireciona visitante para login ao abrir criacao de personagem", async ({ page }) => {
  await page.goto("/characters/new");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Senha")).toBeVisible();
});

test("permite login admin e acesso ao painel de usuarios", async ({ page }) => {
  await login(page, "savitardeus12@gmail.com", "123456");

  await expect(page).toHaveURL(/\/$/);
  await page.goto("/admin/users");

  await expect(page).toHaveURL(/\/admin\/users$/);
  await expect(page.getByRole("heading", { name: /Permissoes Operacionais/i })).toBeVisible();
});

test("admin libera gerenciar personagens para outro usuario", async ({ page }) => {
  const timestamp = Date.now();
  const viewerName = `Viewer E2E ${timestamp}`;
  const viewerEmail = `viewer-e2e-${timestamp}@example.com`;
  const viewerPassword = "123456";

  await page.goto("/register");
  await page.getByLabel("Nome").fill(viewerName);
  await page.getByLabel("Email").fill(viewerEmail);
  await page.getByLabel("Senha").fill(viewerPassword);
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(viewerName)).toBeVisible();
  await logout(page);

  await login(page, "savitardeus12@gmail.com", "123456");
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/admin/users");
  await page.getByPlaceholder("Buscar por nome ou email").fill(viewerEmail);
  const userCard = page.locator("article").filter({ hasText: viewerEmail }).first();
  await expect(userCard).toBeVisible();
  await userCard.getByRole("button", { name: "Gerenciar personagens" }).click();
  await expect(userCard.getByText("Gerenciar personagens")).toBeVisible();

  await logout(page);

  await login(page, viewerEmail, viewerPassword);
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/characters/new");
  await expect(page).toHaveURL(/\/characters\/new$/);
  await expect(page.getByRole("heading", { name: /Novo Personagem/i })).toBeVisible();
});

test("admin consegue editar nome e status de outro usuario", async ({ page }) => {
  const timestamp = Date.now();
  const originalName = `Editable Viewer ${timestamp}`;
  const updatedName = `Editable Viewer Updated ${timestamp}`;
  const viewerEmail = `editable-viewer-${timestamp}@example.com`;
  const viewerPassword = "123456";

  await page.goto("/register");
  await page.getByLabel("Nome").fill(originalName);
  await page.getByLabel("Email").fill(viewerEmail);
  await page.getByLabel("Senha").fill(viewerPassword);
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/$/);
  await logout(page);

  await login(page, "savitardeus12@gmail.com", "123456");
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/admin/users");
  await page.getByPlaceholder("Buscar por nome ou email").fill(viewerEmail);

  const userCard = page.locator("article").filter({ hasText: viewerEmail }).first();
  await expect(userCard).toBeVisible();
  await userCard.getByRole("button", { name: "Editar conta" }).click();

  await page.locator("input.form-input").first().fill(updatedName);
  await page.locator('input[type="checkbox"]').first().uncheck();
  await page.getByRole("button", { name: "Salvar usuario" }).click();

  await expect(userCard.getByText(updatedName)).toBeVisible();
  await expect(userCard.getByText("desativada")).toBeVisible();

  await logout(page);

  await login(page, viewerEmail, viewerPassword);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
});

test("admin exporta auditoria apos alterar permissoes", async ({ page }) => {
  const timestamp = Date.now();
  const viewerName = `Audit Export ${timestamp}`;
  const viewerEmail = `audit-export-${timestamp}@example.com`;
  const viewerPassword = "123456";

  await page.goto("/register");
  await page.getByLabel("Nome").fill(viewerName);
  await page.getByLabel("Email").fill(viewerEmail);
  await page.getByLabel("Senha").fill(viewerPassword);
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/$/);
  await logout(page);

  await login(page, "savitardeus12@gmail.com", "123456");
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/admin/users");
  await page.getByPlaceholder("Buscar por nome ou email").fill(viewerEmail);

  const userCard = page.locator("article").filter({ hasText: viewerEmail }).first();
  await expect(userCard).toBeVisible();
  await userCard.getByRole("button", { name: "Gerenciar personagens" }).click();

  await page.getByRole("button", { name: "Auditoria" }).click();
  await page.getByPlaceholder("Buscar por ator, alvo ou acao").fill(viewerName);
  await expect(page.getByText("Permissoes", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(viewerName, { exact: true })).toBeVisible();

  const jsonDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Exportar JSON/i }).click();
  const jsonDownload = await jsonDownloadPromise;
  expect(jsonDownload.suggestedFilename()).toMatch(/^admin-audit-.*\.json$/);

  const csvDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Exportar CSV/i }).click();
  const csvDownload = await csvDownloadPromise;
  expect(csvDownload.suggestedFilename()).toMatch(/^admin-audit-.*\.csv$/);
});
