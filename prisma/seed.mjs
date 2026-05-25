import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@toolshed.local" },
    update: {},
    create: {
      name: "Alice",
      email: "alice@toolshed.local",
      password,
      apartment: "2A",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@toolshed.local" },
    update: {},
    create: {
      name: "Bob",
      email: "bob@toolshed.local",
      password,
      apartment: "3B",
    },
  });

  const tools = [
    {
      name: "Cordless Drill",
      description: "Bosch 18V cordless drill with two batteries and charger. Great for hanging shelves and basic furniture assembly.",
      category: "power-tools",
      ownerId: alice.id,
    },
    {
      name: "Paint Roller Set",
      description: "Complete roller set with tray, two rollers (smooth and textured), and extension pole. Perfect for walls and ceilings.",
      category: "painting",
      ownerId: alice.id,
    },
    {
      name: "Hedge Trimmer",
      description: "Electric hedge trimmer, 50cm blade. Comes with extension cord. Please return clean.",
      category: "gardening",
      ownerId: bob.id,
    },
    {
      name: "Moving Dolly",
      description: "Heavy-duty furniture dolly. Can handle up to 300kg. Great for moving furniture or heavy boxes.",
      category: "moving",
      ownerId: bob.id,
      deposit: 20,
    },
    {
      name: "Pressure Washer",
      description: "Karcher K2 pressure washer. Perfect for cleaning balconies, patios, and bikes.",
      category: "cleaning",
      ownerId: alice.id,
      deposit: 30,
    },
    {
      name: "Camping Tent (4-person)",
      description: "Coleman 4-person tent, barely used. Includes stakes and rain fly. Great for weekend trips!",
      category: "sports",
      ownerId: bob.id,
    },
  ];

  for (const tool of tools) {
    await prisma.tool.create({ data: tool });
  }

  console.log("Seeded database with 2 demo users and 6 tools");
  console.log("Login with: alice@toolshed.local / password123");
  console.log("       or:  bob@toolshed.local / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
