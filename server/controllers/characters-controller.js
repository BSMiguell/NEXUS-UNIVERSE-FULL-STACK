const {
  createAdminAuditLog,
  createCharacter: createCharacterRecord,
  deleteCharacter: deleteCharacterRecord,
  findCharacterById,
  findCharacters,
  findNextCharacterId,
  updateCharacter: updateCharacterRecord,
} = require("../data/db");
const {
  characterInputSchema,
  charactersQuerySchema,
  getZodMessage,
} = require("../schemas");

async function listCharacters(request, response) {
  response.setHeader("Cache-Control", "no-store");

  const parsedQuery = charactersQuerySchema.safeParse(request.query);

  if (!parsedQuery.success) {
    return response
      .status(400)
      .json({ message: getZodMessage(parsedQuery.error, "Filtros invalidos.") });
  }

  const { search, favorites, category, modelsOnly, page, limit } = parsedQuery.data;
  let filteredCharacters = await findCharacters();

  if (search) {
    filteredCharacters = filteredCharacters.filter((character) =>
      character.name.toLowerCase().includes(String(search).toLowerCase()),
    );
  }

  if (favorites) {
    const favoriteIds = String(favorites)
      .split(",")
      .map((id) => parseInt(id, 10))
      .filter((id) => Number.isFinite(id));

    filteredCharacters = filteredCharacters.filter((character) =>
      favoriteIds.includes(character.id),
    );
  }

  if (category && category !== "all") {
    filteredCharacters = filteredCharacters.filter(
      (character) => character.category === category,
    );
  }

  if (modelsOnly === "true") {
    filteredCharacters = filteredCharacters.filter((character) =>
      Boolean(character.model3d),
    );
  }

  response.json({
    items: filteredCharacters.slice((page - 1) * limit, page * limit),
    totalItems: filteredCharacters.length,
    totalPages: Math.ceil(filteredCharacters.length / limit),
    currentPage: page,
  });
}

async function getCharacterById(request, response) {
  const character = await findCharacterById(Number(request.params.id));

  if (!character) {
    return response.status(404).json({ message: "Personagem nao encontrado." });
  }

  response.json(character);
}

async function createCharacter(request, response) {
  const parsedBody = characterInputSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: getZodMessage(parsedBody.error, "Dados do personagem invalidos."),
    });
  }

  const newCharacter = await createCharacterRecord({
    id: await findNextCharacterId(),
    ...parsedBody.data,
  });

  await createAdminAuditLog({
    actorUserId: request.user.id,
    actorName: request.user.name,
    targetUserId: newCharacter.id,
    targetUserName: newCharacter.name,
    action: "character.created",
    details: {
      category: newCharacter.category,
      hasModel3d: Boolean(newCharacter.model3d),
    },
  });

  response.status(201).json(newCharacter);
}

async function updateCharacter(request, response) {
  const characterId = Number(request.params.id);
  const currentCharacter = await findCharacterById(characterId);

  if (!currentCharacter) {
    return response.status(404).json({ message: "Personagem nao encontrado." });
  }

  const parsedBody = characterInputSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: getZodMessage(parsedBody.error, "Dados do personagem invalidos."),
    });
  }

  const updatedCharacter = await updateCharacterRecord(characterId, parsedBody.data);

  await createAdminAuditLog({
    actorUserId: request.user.id,
    actorName: request.user.name,
    targetUserId: updatedCharacter.id,
    targetUserName: updatedCharacter.name,
    action: "character.updated",
    details: {
      previousName: currentCharacter.name,
      category: updatedCharacter.category,
      hasModel3d: Boolean(updatedCharacter.model3d),
    },
  });

  response.json(updatedCharacter);
}

async function deleteCharacter(request, response) {
  const characterId = Number(request.params.id);
  const currentCharacter = await findCharacterById(characterId);

  if (!currentCharacter) {
    return response.status(404).json({ message: "Personagem nao encontrado." });
  }

  await deleteCharacterRecord(characterId);

  await createAdminAuditLog({
    actorUserId: request.user.id,
    actorName: request.user.name,
    targetUserId: currentCharacter.id,
    targetUserName: currentCharacter.name,
    action: "character.deleted",
    details: {
      category: currentCharacter.category,
      hadModel3d: Boolean(currentCharacter.model3d),
    },
  });

  response.status(204).send();
}

module.exports = {
  createCharacter,
  deleteCharacter,
  getCharacterById,
  listCharacters,
  updateCharacter,
};
