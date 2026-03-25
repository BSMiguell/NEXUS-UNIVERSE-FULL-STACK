const express = require("express");
const {
  createCharacter,
  deleteCharacter,
  getCharacterById,
  listCharacters,
  updateCharacter,
} = require("../controllers/characters-controller");
const { requireAuth, requirePermission } = require("../middleware/auth");

const router = express.Router();

router.get("/", listCharacters);
router.get("/:id", getCharacterById);
router.post("/", requireAuth, requirePermission("canManageCharacters"), createCharacter);
router.put("/:id", requireAuth, requirePermission("canManageCharacters"), updateCharacter);
router.delete("/:id", requireAuth, requirePermission("canManageCharacters"), deleteCharacter);

module.exports = router;
