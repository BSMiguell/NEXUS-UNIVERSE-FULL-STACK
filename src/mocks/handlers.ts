import { http, HttpResponse } from "msw";

const characters = [
  {
    id: 1,
    name: "Goku",
    category: "Dragon Ball",
    image: "/assets/images/Dragon-Ball/Goku-1.png",
    description: "Um guerreiro saiyajin.",
    model3d: "/assets/models/goku.glb",
    details: { universo: "Dragon Ball" },
    stats: {
      forca: 100,
      velocidade: 95,
      defesa: 90,
      energia: 100,
      habilidade: 92,
    },
  },
  {
    id: 2,
    name: "Vegeta",
    category: "Dragon Ball",
    image: "/assets/images/Dragon-Ball/Vegeta-1.png",
    description: "Principe dos saiyajins.",
    model3d: "/assets/models/vegeta.glb",
    details: { universo: "Dragon Ball" },
    stats: {
      forca: 97,
      velocidade: 90,
      defesa: 88,
      energia: 96,
      habilidade: 91,
    },
  },
  {
    id: 3,
    name: "Luffy",
    category: "One Piece",
    image: "/assets/images/One-Piece/Luffy-1.png",
    description: "Capitao dos piratas do chapeu de palha.",
    model3d: "/assets/models/luffy.glb",
    details: { universo: "One Piece" },
    stats: {
      forca: 89,
      velocidade: 86,
      defesa: 82,
      energia: 80,
      habilidade: 88,
    },
  },
];

export const handlers = [
  http.get("/api/characters", ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    const category = url.searchParams.get("category");
    const favorites = url.searchParams.get("favorites");
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "12");
    const modelsOnly = url.searchParams.get("modelsOnly") === "true";

    let filtered = [...characters];

    if (search) {
      filtered = filtered.filter((character) =>
        character.name.toLowerCase().includes(search),
      );
    }

    if (category && category !== "all") {
      filtered = filtered.filter((character) => character.category === category);
    }

    if (favorites) {
      const favoriteIds = favorites
        .split(",")
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id));
      filtered = filtered.filter((character) => favoriteIds.includes(character.id));
    }

    if (modelsOnly) {
      filtered = filtered.filter((character) => Boolean(character.model3d));
    }

    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return HttpResponse.json({
      items,
      totalItems: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      currentPage: page,
    });
  }),
  http.post("/api/auth/register", async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      email: string;
    };

    return HttpResponse.json(
      {
        token: "mock-register-token",
        user: {
          id: 101,
          name: body.name,
          email: body.email,
          role: "admin",
          permissions: {
            canManageCharacters: true,
          },
        },
      },
      { status: 201 },
    );
  }),
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
    };

    return HttpResponse.json({
      token: "mock-login-token",
      user: {
        id: 101,
        name: "Mock User",
        email: body.email,
        role: "admin",
        permissions: {
          canManageCharacters: true,
        },
      },
    });
  }),
  http.get("/api/me/favorites", () =>
    HttpResponse.json({
      favoriteIds: [1, 2],
    }),
  ),
];
