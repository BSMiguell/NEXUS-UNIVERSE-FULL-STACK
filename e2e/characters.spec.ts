import { expect, test, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("savitardeus12@gmail.com");
  await page.getByLabel("Senha").fill("123456");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/$/);
}

async function createCharacterFromForm(
  page: Page,
  values: {
    name: string;
    category: string;
    image?: string;
    model3d?: string;
    description?: string;
    detailsJson?: string;
  },
) {
  await page.goto("/characters/new");
  await expect(page.getByRole("heading", { name: /Novo Personagem/i })).toBeVisible();

  await page.getByLabel("Nome").fill(values.name);
  await page.getByLabel("Categoria").fill(values.category);
  await page
    .getByLabel("Imagem")
    .fill(values.image ?? "/library-assets/One-piece/Monkey-D-Luffy.webp");
  await page.getByLabel("Modelo 3D").fill(values.model3d ?? "/library-assets/demo/luffy.glb");
  await page.getByLabel("Descricao").fill(
    values.description ??
      "Personagem criado automaticamente no E2E para validar fluxos administrativos do painel.",
  );
  await page.getByLabel("Forca").fill("95");
  await page.getByLabel("Velocidade").fill("88");
  await page.getByLabel("Defesa").fill("77");
  await page.getByLabel("Energia").fill("99");
  await page.getByLabel("Habilidade").fill("91");
  await page
    .getByLabel("Detalhes JSON")
    .fill(values.detailsJson ?? '{ "origem": "suite-e2e", "rank": "temporario" }');

  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page).toHaveURL(/\/$/);
}

async function openFavoriteButtonOnDetail(page: Page, id: number) {
  await page.goto(`/personagem/${id}`);
  const favoriteButton = page.locator("button:has(svg.lucide-heart)").first();
  await expect(favoriteButton).toBeVisible();
  return favoriteButton;
}

async function openAdminTab(page: Page, tabName: "Usuarios" | "Auditoria" | "Personagens") {
  await page.goto("/admin/users");
  await page.getByRole("button", { name: tabName }).first().click();
}

test("permite editar personagem em rota protegida de admin", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/characters/1/edit");
  await expect(page.getByRole("heading", { name: /Editar Personagem/i })).toBeVisible();

  await page.getByLabel("Nome").fill("Monkey D. Luffy");
  await page.getByLabel("Categoria").fill("One Piece");
  await page.getByLabel("Imagem").fill("/library-assets/One-piece/Monkey-D-Luffy.webp");
  const descriptionField = page.getByLabel("Descricao");
  await descriptionField.fill(
    "Capitao dos Piratas do Chapeu de Palha em modo E2E, sempre pronto para proteger a tripulacao.",
  );
  await page.getByLabel("Detalhes JSON").fill('{ "origem": "East Blue" }');
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Monkey D. Luffy" })).toBeVisible();
});

test("permite criar e excluir personagem como admin", async ({ page }) => {
  const suffix = Date.now();
  const characterName = `E2E HERO ${suffix}`;

  await loginAsAdmin(page);

  await createCharacterFromForm(page, {
    name: characterName,
    category: "E2E",
    description:
      "Personagem criado automaticamente no E2E para validar o fluxo completo de criacao e remocao.",
  });

  await page.getByPlaceholder("Buscar personagem no multiverso").fill(characterName);
  await expect(page.getByRole("heading", { name: characterName })).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Excluir" }).click();

  await expect(page.getByRole("heading", { name: characterName })).toHaveCount(0);
});

test("permite adicionar e remover favorito pela interface", async ({ page }) => {
  await loginAsAdmin(page);

  const addFavoriteButton = await openFavoriteButtonOnDetail(page, 12);
  await addFavoriteButton.click();
  await expect(addFavoriteButton.locator("svg")).toHaveClass(/fill-red-500/);
  await page.getByRole("link", { name: /Favoritos/i }).click();
  await expect(page.getByRole("heading", { name: /Favoritos/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "KENPACHI ZARAKI" })).toBeVisible();

  const removeFavoriteButton = await openFavoriteButtonOnDetail(page, 12);
  await removeFavoriteButton.click();
  await expect(removeFavoriteButton.locator("svg")).not.toHaveClass(/fill-red-500/);
  await page.getByRole("link", { name: /Favoritos/i }).click();
  await expect(page.getByRole("heading", { name: "KENPACHI ZARAKI" })).toHaveCount(0);
});

test("auditoria exibe eventos recentes de personagem no painel admin", async ({ page }) => {
  const suffix = Date.now();
  const characterName = `AUDIT HERO ${suffix}`;

  await loginAsAdmin(page);
  await createCharacterFromForm(page, {
    name: characterName,
    category: "AUDIT-E2E",
    description: "Personagem temporario criado para validar a aba de auditoria do painel admin.",
  });

  await openAdminTab(page, "Auditoria");
  await page.getByPlaceholder("Buscar por ator, alvo ou acao").fill(characterName);

  await expect(page.getByText("Personagem criado")).toBeVisible();
  await expect(page.getByText(characterName)).toBeVisible();
});

test("painel admin executa lote de mover categoria com personagens visiveis", async ({ page }) => {
  const batchCategory = `BATCH-VISIBLE-${Date.now()}`;
  const targetCategory = "One Piece";
  const characterName = `CATEGORY SEED ${Date.now()}`;

  await loginAsAdmin(page);
  await createCharacterFromForm(page, {
    name: characterName,
    category: batchCategory,
  });

  await openAdminTab(page, "Personagens");
  await page.getByRole("combobox", { name: "Categoria" }).selectOption(batchCategory);
  await expect(page.getByRole("heading", { name: characterName })).toBeVisible();
  await page.getByRole("button", { name: "Selecionar pagina" }).click();
  await page.getByRole("combobox", { name: "Mover para" }).selectOption(targetCategory);
  await page.getByRole("button", { name: "Mover categoria" }).click();
  await expect(page.getByText(/Categoria: .*ok, 0 falhas/i)).toBeVisible();
  await page.getByRole("combobox", { name: "Categoria" }).selectOption("all");
  await page.getByPlaceholder("Buscar personagem").fill(characterName);
  await expect(page.getByRole("heading", { name: characterName })).toBeVisible();
});

test("painel admin permite repetir e exportar falhas de lote", async ({ page }) => {
  const batchCategory = `BATCH-FAIL-${Date.now()}`;
  const targetCategory = "Naruto";
  const firstCharacterName = `FAIL TARGET A ${Date.now()}`;
  const secondCharacterName = `FAIL TARGET B ${Date.now() + 1}`;

  await loginAsAdmin(page);
  await createCharacterFromForm(page, {
    name: firstCharacterName,
    category: batchCategory,
  });
  await createCharacterFromForm(page, {
    name: secondCharacterName,
    category: batchCategory,
  });

  let failedCharacterId: string | null = null;
  let failureInjected = false;

  await page.route("**/api/characters/*", async (route) => {
    if (route.request().method() !== "PUT") {
      await route.continue();
      return;
    }

    const requestUrl = new URL(route.request().url());
    const characterId = requestUrl.pathname.split("/").pop() ?? null;

    if (!failureInjected) {
      failureInjected = true;
      failedCharacterId = characterId;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Falha simulada no lote" }),
      });
      return;
    }

    await route.continue();
  });

  await openAdminTab(page, "Personagens");
  await page.getByRole("combobox", { name: "Categoria" }).selectOption(batchCategory);
  await expect(page.getByRole("heading", { name: firstCharacterName })).toBeVisible();
  await expect(page.getByRole("heading", { name: secondCharacterName })).toBeVisible();
  await page.getByRole("button", { name: "Selecionar pagina" }).click();
  await page.getByRole("combobox", { name: "Mover para" }).selectOption(targetCategory);
  await page.getByRole("button", { name: "Mover categoria" }).click();

  await expect(page.getByText(/Categoria: 1 ok, 1 falhas/i)).toBeVisible();
  await expect.poll(() => failedCharacterId).not.toBeNull();

  const downloadJsonPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar falhas JSON" }).click();
  const jsonDownload = await downloadJsonPromise;
  expect(jsonDownload.suggestedFilename()).toMatch(/^batch-failures-.*\.json$/);

  const downloadCsvPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar falhas CSV" }).click();
  const csvDownload = await downloadCsvPromise;
  expect(csvDownload.suggestedFilename()).toMatch(/^batch-failures-.*\.csv$/);

  await page.getByRole("button", { name: "Copiar IDs falhos" }).click();
  await expect(
    page.getByText(/IDs copiados|Falha ao copiar IDs/i),
  ).toBeVisible();

  await page.getByRole("button", { name: "Repetir falhas" }).click();
  await expect(page.getByText("1 selecionados")).toBeVisible();

  await page.getByLabel("Apenas falhas").check();
  await expect(page.getByRole("heading", { name: firstCharacterName })).toHaveCount(failedCharacterId === null ? 0 : 1);

  await page.unroute("**/api/characters/*");

  await page.getByRole("combobox", { name: "Mover para" }).selectOption(targetCategory);
  await page.getByRole("button", { name: "Mover categoria" }).click();
  await expect(page.getByText(/Categoria: 1 ok, 0 falhas/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Limpar falhas" })).toBeDisabled();
  await expect(page.getByRole("checkbox", { name: "Apenas falhas" })).toBeDisabled();
});
