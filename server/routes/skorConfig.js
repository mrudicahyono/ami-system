const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    res.json(await db.all2("SELECT * FROM skor_config ORDER BY nilai"));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:nilai", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { label, warna } = req.body;
    await db.run2("UPDATE skor_config SET label=?, warna=? WHERE nilai=?",
      [label, warna, req.params.nilai]);
    res.json({ message: "Skor config diupdate" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
