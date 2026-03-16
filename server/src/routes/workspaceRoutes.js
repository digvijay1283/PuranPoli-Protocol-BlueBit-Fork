const express = require("express");
const { auth, optionalAuth } = require("../middlewares/auth");

const {
  listWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listMyWorkspaces,
  publishWorkspace,
  unpublishWorkspace,
  importChain,
} = require("../controllers/workspaceController");

const router = express.Router();

// Public workspace CRUD (main app uses these without auth)
router.get("/", listWorkspaces);
router.get("/mine", auth, listMyWorkspaces);
router.get("/:id", getWorkspace);
router.post("/", optionalAuth, createWorkspace);
router.patch("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

// Publishing (auth required)
router.patch("/:id/publish", auth, publishWorkspace);
router.patch("/:id/unpublish", auth, unpublishWorkspace);

// Import (public — main app doesn't have auth yet)
router.post("/:id/import", importChain);

module.exports = router;
