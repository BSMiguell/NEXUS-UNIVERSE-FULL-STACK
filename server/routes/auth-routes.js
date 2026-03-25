const express = require("express");
const { login, register } = require("../controllers/auth-controller");
const { authRateLimiter } = require("../middleware/security");

const router = express.Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);

module.exports = router;
