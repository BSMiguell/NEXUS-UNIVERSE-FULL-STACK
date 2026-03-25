const {
  addFavorite: addFavoriteRecord,
  findCharacterById,
  listFavoriteIds,
  removeFavorite: removeFavoriteRecord,
} = require("../data/db");

async function listFavorites(request, response) {
  response.json({
    favoriteIds: await listFavoriteIds(request.user.id),
  });
}

async function addFavorite(request, response) {
  const characterId = Number(request.body?.characterId);

  if (!characterId) {
    return response.status(400).json({ message: "characterId obrigatorio." });
  }

  const characterExists = await findCharacterById(characterId);

  if (!characterExists) {
    return response.status(404).json({ message: "Personagem nao encontrado." });
  }

  await addFavoriteRecord(request.user.id, characterId);

  response.status(201).json({
    favoriteIds: await listFavoriteIds(request.user.id),
  });
}

async function removeFavorite(request, response) {
  const characterId = Number(request.params.characterId);
  await removeFavoriteRecord(request.user.id, characterId);
  response.status(204).send();
}

module.exports = {
  addFavorite,
  listFavorites,
  removeFavorite,
};
