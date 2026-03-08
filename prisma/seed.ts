import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { v4 as uuidv4 } from "uuid";

//data imports
import rolePermissions from "./data/permissions.json";
import usersData from "./data/users.json";
import rolesData from "./data/roles.json";
import categoriesData from "./data/categories.json";
import inventoriesData from "./data/inventories.json";
import suppliersData from "./data/suppliers.json";

// Create adapter with Pool (required for @prisma/adapter-pg)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"],
});

async function main() {
  console.log("Starting seed...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  // Test connection
  await prisma.$connect();
  console.log("Database connected");

  console.log("----------------------------------------------");
  console.log("Seeding Permissions...");

  await prisma.permission.createMany({
    data: rolePermissions,
    skipDuplicates: true,
  });

  console.log("Seeding Permissions Done");
  console.log("----------------------------------------------");

  console.log("----------------------------------------------");
  console.log("Seeding Roles...");
  const permissions = await prisma.permission.findMany();
  const roleMap: Record<string, string> = {};
  for (const roleData of rolesData) {
    let rolePermissions;
    if (roleData.permissions === "all") {
      rolePermissions = permissions;
    } else if (roleData.permissions === "read_only") {
      rolePermissions = permissions.filter((p) => p.action === "read");
    } else {
      const { modules, extra } = roleData.permissions as {
        modules: string[];
        extra: { module: string; action: string }[];
      };
      rolePermissions = permissions.filter(
        (p) =>
          modules.includes(p.module) ||
          extra.some((e) => e.module === p.module && e.action === p.action),
      );
    }
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        permissions: { set: rolePermissions.map((p) => ({ id: p.id })) },
      },
      create: {
        name: roleData.name,
        description: roleData.description,
        permissions: { connect: rolePermissions.map((p) => ({ id: p.id })) },
      },
    });
    roleMap[role.name] = role.id;
  }
  console.log("Seeding Roles Done");
  console.log("----------------------------------------------");

  console.log("----------------------------------------------");
  console.log("Seeding Users...");
  for (const userData of usersData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const result = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        id: uuidv4(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        password: hashedPassword,
        roleId: roleMap[userData.role],
        isActive: userData.isActive,
        emailVerifiedAt: new Date(),
      },
    });
  }
  console.log("Seeding Users Done");
  console.log("----------------------------------------------");

  console.log("----------------------------------------------");
  console.log("Seeding Categories...");
  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
      },
    });
  }
  console.log("Seeding Categories Done");
  console.log("----------------------------------------------");

  console.log("----------------------------------------------");
  console.log("Seeding Inventories...");
  for (const inv of inventoriesData) {
    const category = await prisma.category.findUnique({
      where: { name: inv.category },
    });
    if (!category) {
      console.log(`Category not found: ${inv.category}`);
      continue;
    }
    await prisma.inventory.upsert({
      where: { name: inv.name },
      update: {},
      create: {
        name: inv.name,
        description: inv.description,
        categoryId: category.id,
        quantity: inv.quantity,
        minimumStock: inv.minimumStock,
        unitPrice: inv.unitPrice,
        unit: inv.unit as any,
        status: inv.status as any,
      },
    });
  }
  console.log("Seeding Inventories Done");
  console.log("----------------------------------------------");

  console.log("----------------------------------------------");
  console.log("Seeding Suppliers...");
  for (const sup of suppliersData) {
    await prisma.supplier.upsert({
      where: { name: sup.name },
      update: {},
      create: {
        name: sup.name,
        email: sup.email,
        phone: sup.phone,
        address: sup.address,
        notes: sup.notes,
      },
    });
  }
  console.log("Seeding Suppliers Done");
  console.log("----------------------------------------------");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Disconnecting...");
    await prisma.$disconnect();
    await pool.end();
  });
