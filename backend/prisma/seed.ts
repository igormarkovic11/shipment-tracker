import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const customer1 = await prisma.customer.create({
    data: {
      name: "Marko Marković",
      email: "marko@example.com",
      address: "Bijeljina",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Pera Perić",
      email: "pera@example.com",
      address: "Novi Sad",
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: "Jovana Jovanović",
      email: "jovan@example.com",
      address: "Subotica",
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      name: "Nikola Nikolić",
      email: "nikola@example.com",
      address: "Beograd",
    },
  });

  const customer5 = await prisma.customer.create({
    data: {
      name: "Ana Anić",
      email: "ana@example.com",
      address: "Kragujevac",
    },
  });

  const customer6 = await prisma.customer.create({
    data: {
      name: "Stefan Petrović",
      email: "stefan@example.com",
      address: "Novi Sad",
    },
  });

  const customer7 = await prisma.customer.create({
    data: {
      name: "Milica Ilić",
      email: "milica@example.com",
      address: "Niš",
    },
  });

  const customer8 = await prisma.customer.create({
    data: {
      name: "Luka Stojanović",
      email: "luka@example.com",
      address: "Čačak",
    },
  });

  const shipment1 = await prisma.shipment.create({
    data: {
      customerId: customer1.id,
      destination: "Beograd",
      status: "out_for_delivery",
      promisedDate: new Date("2026-09-10"),
    },
  });

  await prisma.shipmentEvent.createMany({
    data: [
      {
        shipmentId: shipment1.id,
        status: "confirmed",
        occurredAt: new Date("2026-09-05"),
      },
      {
        shipmentId: shipment1.id,
        status: "picked_up",
        occurredAt: new Date("2026-09-06"),
      },
      {
        shipmentId: shipment1.id,
        status: "departed",
        occurredAt: new Date("2026-09-07"),
      },
      {
        shipmentId: shipment1.id,
        status: "out_for_delivery",
        occurredAt: new Date("2026-09-09"),
      },
    ],
  });

  const shipment2 = await prisma.shipment.create({
    data: {
      customerId: customer2.id,
      destination: "Niš",
      status: "confirmed",
      promisedDate: new Date("2026-09-20"),
    },
  });

  await prisma.shipmentEvent.create({
    data: {
      shipmentId: shipment2.id,
      status: "confirmed",
      occurredAt: new Date("2026-09-14"),
    },
  });

  const shipment3 = await prisma.shipment.create({
    data: {
      customerId: customer3.id,
      destination: "Kraljevo",
      status: "picked_up",
      promisedDate: new Date("2026-09-18"),
    },
  });

  await prisma.shipmentEvent.createMany({
    data: [
      {
        shipmentId: shipment3.id,
        status: "confirmed",
        occurredAt: new Date("2026-09-13"),
      },
      {
        shipmentId: shipment3.id,
        status: "picked_up",
        occurredAt: new Date("2026-09-14"),
      },
    ],
  });

  const shipment4 = await prisma.shipment.create({
    data: {
      customerId: customer4.id,
      destination: "Novi Sad",
      status: "departed",
      promisedDate: new Date("2026-09-17"),
    },
  });

  await prisma.shipmentEvent.createMany({
    data: [
      {
        shipmentId: shipment4.id,
        status: "confirmed",
        occurredAt: new Date("2026-09-12"),
      },
      {
        shipmentId: shipment4.id,
        status: "picked_up",
        occurredAt: new Date("2026-09-13"),
      },
      {
        shipmentId: shipment4.id,
        status: "departed",
        occurredAt: new Date("2026-09-14"),
      },
    ],
  });

  const shipment5 = await prisma.shipment.create({
    data: {
      customerId: customer5.id,
      destination: "Subotica",
      status: "confirmed",
      promisedDate: new Date("2026-09-22"),
    },
  });

  await prisma.shipmentEvent.create({
    data: {
      shipmentId: shipment5.id,
      status: "confirmed",
      occurredAt: new Date("2026-09-15"),
    },
  });

  const shipment6 = await prisma.shipment.create({
    data: {
      customerId: customer6.id,
      destination: "Zrenjanin",
      status: "picked_up",
      promisedDate: new Date("2026-09-19"),
    },
  });

  await prisma.shipmentEvent.createMany({
    data: [
      {
        shipmentId: shipment6.id,
        status: "confirmed",
        occurredAt: new Date("2026-09-13"),
      },
      {
        shipmentId: shipment6.id,
        status: "picked_up",
        occurredAt: new Date("2026-09-15"),
      },
    ],
  });

  const shipment7 = await prisma.shipment.create({
    data: {
      customerId: customer7.id,
      destination: "Kruševac",
      status: "out_for_delivery",
      promisedDate: new Date("2026-09-15"),
    },
  });

  await prisma.shipmentEvent.createMany({
    data: [
      {
        shipmentId: shipment7.id,
        status: "confirmed",
        occurredAt: new Date("2026-09-11"),
      },
      {
        shipmentId: shipment7.id,
        status: "picked_up",
        occurredAt: new Date("2026-09-12"),
      },
      {
        shipmentId: shipment7.id,
        status: "departed",
        occurredAt: new Date("2026-09-13"),
      },
      {
        shipmentId: shipment7.id,
        status: "out_for_delivery",
        occurredAt: new Date("2026-09-15"),
      },
    ],
  });

  const shipment8 = await prisma.shipment.create({
    data: {
      customerId: customer8.id,
      destination: "Valjevo",
      status: "confirmed",
      promisedDate: new Date("2026-09-25"),
    },
  });

  await prisma.shipmentEvent.create({
    data: {
      shipmentId: shipment8.id,
      status: "confirmed",
      occurredAt: new Date("2026-09-15"),
    },
  });

  const shipment9 = await prisma.shipment.create({
    data: {
      customerId: customer1.id,
      destination: "Sarajevo",
      status: "departed",
      promisedDate: new Date("2026-09-08"),
    },
  });

  await prisma.shipmentEvent.createMany({
    data: [
      {
        shipmentId: shipment9.id,
        status: "confirmed",
        occurredAt: new Date("2026-09-03"),
      },
      {
        shipmentId: shipment9.id,
        status: "picked_up",
        occurredAt: new Date("2026-09-04"),
      },
      {
        shipmentId: shipment9.id,
        status: "departed",
        occurredAt: new Date("2026-09-05"),
      },
    ],
  });

  const shipment10 = await prisma.shipment.create({
    data: {
      customerId: customer4.id,
      destination: "Pančevo",
      status: "out_for_delivery",
      promisedDate: new Date("2026-09-16"),
    },
  });

  await prisma.shipmentEvent.createMany({
    data: [
      {
        shipmentId: shipment10.id,
        status: "confirmed",
        occurredAt: new Date("2026-09-12"),
      },
      {
        shipmentId: shipment10.id,
        status: "picked_up",
        occurredAt: new Date("2026-09-13"),
      },
      {
        shipmentId: shipment10.id,
        status: "departed",
        occurredAt: new Date("2026-09-14"),
      },
      {
        shipmentId: shipment10.id,
        status: "out_for_delivery",
        occurredAt: new Date("2026-09-15"),
      },
    ],
  });

  console.log("Seed data successfully created!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
