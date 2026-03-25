const express = require("express");
const {
  listAuditLogs,
  listAdminUsers,
  updateAdminUser,
  updateUserPermissions,
} = require("../controllers/admin-controller");
const { requireAuth, requirePermission } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requirePermission("canManageUsers"));

router.get("/users", listAdminUsers);
router.get("/audit-logs", listAuditLogs);
router.patch("/users/:id", updateAdminUser);
router.patch("/users/:id/permissions", updateUserPermissions);

module.exports = router;
