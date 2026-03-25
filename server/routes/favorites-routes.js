const express = require("express");
const {
  addFavorite,
  listFavorites,
  removeFavorite,
} = require("../controllers/favorites-controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, listFavorites);
router.post("/", requireAuth, addFavorite);
router.delete("/:characterId", requireAuth, removeFavorite);

module.exports = router;
