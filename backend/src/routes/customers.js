const express = require("express");
const router = express.Router();
const prisma = require("../db");

router.get("/", async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: "asc" },
    });
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

module.exports = router;
