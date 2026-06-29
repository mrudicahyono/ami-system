const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET semua config
router.get("/", verifyToken, async (req, res) => {
  try {
    res.json(await db.all2("SELECT * FROM app_config ORDER BY id"));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update config by key
router.put("/:key", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined || value === "")
      return res.status(400).json({ message: "Value wajib diisi" });
    const exists = await db.get2("SELECT id FROM app_config WHERE key=?", [req.params.key]);
    if (!exists) return res.status(404).json({ message: "Config tidak ditemukan" });
    await db.run2(
      "UPDATE app_config SET value=?, updated_at=CURRENT_TIMESTAMP WHERE key=?",
      [value, req.params.key]
    );
    res.json({ message: "Config diupdate" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;