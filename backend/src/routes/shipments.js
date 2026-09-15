const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { isValidTransition } = require("../utils/transitions");

// Helper: da li je shipment "late" (Q1 — computed, ne stored)
function computeLateInfo(shipment) {
  const now = new Date();
  const isDelivered = shipment.status === "delivered";
  const promised = new Date(shipment.promisedDate);

  if (isDelivered) {
    // ako je dostavljen, "late" gleda kad je zadnji event bio 'delivered'
    const deliveredEvent = shipment.events?.find(
      (e) => e.status === "delivered",
    );
    const deliveredAt = deliveredEvent
      ? new Date(deliveredEvent.occurredAt)
      : null;
    const isLate = deliveredAt ? deliveredAt > promised : false;
    return {
      isLate,
      daysLate: isLate ? Math.floor((deliveredAt - promised) / 86400000) : 0,
    };
  }

  const isLate = now > promised;
  return {
    isLate,
    daysLate: isLate ? Math.floor((now - promised) / 86400000) : 0,
  };
}

// GET /api/shipments?status=&late=&sort=
router.get("/", async (req, res) => {
  try {
    const { status, late, sort } = req.query;

    const where = {};
    if (status) where.status = status;

    const shipments = await prisma.shipment.findMany({
      where,
      include: { customer: true, events: true },
    });

    let result = shipments.map((s) => {
      const { isLate, daysLate } = computeLateInfo(s);
      return {
        id: s.id,
        customerName: s.customer.name,
        destination: s.destination,
        status: s.status,
        promisedDate: s.promisedDate,
        isLate,
        daysLate,
      };
    });

    if (late === "true") {
      result = result.filter((s) => s.isLate);
    }

    if (sort === "late_first") {
      result.sort((a, b) => b.daysLate - a.daysLate);
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
});

// GET /api/shipments/:id — detalj sa punom istorijom
router.get("/:id", async (req, res) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        customer: true,
        events: { orderBy: { occurredAt: "asc" } },
      },
    });

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const { isLate, daysLate } = computeLateInfo(shipment);
    res.json({ ...shipment, isLate, daysLate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shipment" });
  }
});

// POST /api/shipments — kreiranje
router.post("/", async (req, res) => {
  try {
    const { customerId, destination, promisedDate } = req.body;

    if (!customerId || !destination || !promisedDate) {
      return res
        .status(400)
        .json({
          error: "customerId, destination and promisedDate are required",
        });
    }

    const shipment = await prisma.shipment.create({
      data: {
        customerId: Number(customerId),
        destination,
        promisedDate: new Date(promisedDate),
        status: "confirmed",
      },
    });

    // prvi event odmah kreiran zajedno sa shipmentom
    await prisma.shipmentEvent.create({
      data: { shipmentId: shipment.id, status: "confirmed" },
    });

    res.status(201).json(shipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create shipment" });
  }
});

// POST /api/shipments/:id/events — srž Q2/Q4: server enforce-uje prelaze
router.post("/:id/events", async (req, res) => {
  try {
    const shipmentId = Number(req.params.id);
    const { status: newStatus, note } = req.body;

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });
    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    if (!isValidTransition(shipment.status, newStatus)) {
      return res.status(409).json({
        error: `Cannot transition from '${shipment.status}' to '${newStatus}'`,
      });
    }

    const event = await prisma.shipmentEvent.create({
      data: { shipmentId, status: newStatus, note },
    });

    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: newStatus },
    });

    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record event" });
  }
});

module.exports = router;
