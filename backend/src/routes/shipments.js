const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { isValidTransition } = require("../utils/transitions");

function computeLateInfo(shipment) {
  const now = new Date();
  const isDelivered = shipment.status === "delivered";
  const promised = new Date(shipment.promisedDate);

  if (["lost", "damaged", "refused"].includes(shipment.status)) {
    return { isLate: false, daysLate: 0 };
  }

  if (isDelivered) {
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

router.get("/", async (req, res) => {
  try {
    const { status, late, search, sortBy, order = "asc" } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(req.query.pageSize) || 20),
    );

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { destination: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const dbSortMap = {
      promisedDate: { promisedDate: order },
      destination: { destination: order },
      status: { status: order },
      customer: { customer: { name: order } },
    };

    const needsInMemoryPass = late === "true" || sortBy === "daysLate";

    const query = {
      where,
      include: { customer: true, events: true },
      orderBy: dbSortMap[sortBy] || { promisedDate: "asc" },
    };

    if (!needsInMemoryPass) {
      query.skip = (page - 1) * pageSize;
      query.take = pageSize;
    }

    const [rows, totalInDb] = await Promise.all([
      prisma.shipment.findMany(query),
      prisma.shipment.count({ where }),
    ]);

    let result = rows.map((s) => {
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

    let total = totalInDb;

    if (needsInMemoryPass) {
      if (late === "true") result = result.filter((s) => s.isLate);
      if (sortBy === "daysLate") {
        result.sort((a, b) =>
          order === "asc" ? a.daysLate - b.daysLate : b.daysLate - a.daysLate,
        );
      }
      total = result.length;
      result = result.slice((page - 1) * pageSize, page * pageSize);
    }

    res.json({
      data: result,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
});

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

router.post("/", async (req, res) => {
  try {
    const { customerId, destination, promisedDate } = req.body;

    if (!customerId || !destination || !promisedDate) {
      return res.status(400).json({
        error: "customerId, destination and promisedDate are required",
      });
    }

    const promised = new Date(promisedDate);
    if (isNaN(promised.getTime())) {
      return res
        .status(400)
        .json({ error: "promisedDate is not a valid date" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (promised < today) {
      return res
        .status(400)
        .json({ error: "promisedDate cannot be in the past" });
    }

    const shipment = await prisma.shipment.create({
      data: {
        customerId: Number(customerId),
        destination,
        promisedDate: new Date(promisedDate),
        status: "confirmed",
      },
    });

    await prisma.shipmentEvent.create({
      data: { shipmentId: shipment.id, status: "confirmed" },
    });

    res.status(201).json(shipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create shipment" });
  }
});

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
