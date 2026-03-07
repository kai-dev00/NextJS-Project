import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { v4 as uuidv4 } from "uuid";

import rolePermissions from "./data/permissions.json";

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

  await prisma.permission.createMany({
    data: rolePermissions,
    skipDuplicates: true,
  });

  const permissions = await prisma.permission.findMany();
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {
      permissions: {
        set: permissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: "ADMIN",
      description: "Administrator with full access",
      permissions: {
        connect: permissions.map((p) => ({ id: p.id })),
      },
    },
  });
  const moderatorPermissions = permissions.filter(
    (p) =>
      p.module === "categories" ||
      p.module === "inventory" ||
      p.module === "supplier" ||
      p.module === "purchase" ||
      (p.module === "users" && p.action === "read") ||
      (p.module === "roles" && p.action === "read"),
  );
  const moderatorRole = await prisma.role.upsert({
    where: { name: "MODERATOR" },
    update: {
      permissions: {
        set: moderatorPermissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: "MODERATOR",
      description: "Moderator with elevated permissions",
      permissions: {
        connect: moderatorPermissions.map((p) => ({ id: p.id })),
      },
    },
  });
  const userPermissions = permissions.filter((p) => p.action === "read");
  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {
      permissions: {
        set: userPermissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      name: "USER",
      description: "Regular user with basic access",
      permissions: {
        connect: userPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  // Step 2: Seed Users
  console.log("Seeding Users...");
  const password = await bcrypt.hash("Password123", 10);
  const users = [
    {
      id: uuidv4(),
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      fullName: "Admin User",
      phoneNumber: "+1234567890",
      password,
      roleId: userRole.id,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
    {
      id: uuidv4(),
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      phoneNumber: "+1234567890",
      password,
      roleId: moderatorRole.id,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
    {
      id: uuidv4(),
      email: "kyle@gmail.com",
      firstName: "Kyle",
      lastName: "Manuel",
      fullName: "Kyle Manuel",
      phoneNumber: "+1234567890",
      password,
      roleId: adminRole.id,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  ];

  console.log(`Upserting ${users.length} users...`);

  for (const user of users) {
    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`${result.email} (${result.id})`);
  }

  // Verify
  const count = await prisma.user.count();
  console.log(`Seeding complete! Total users: ${count}`);

  // List all users
  const allUsers = await prisma.user.findMany({
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
  console.log("All users:");
  allUsers.forEach((u) => {
    console.log(
      `  - ${u.email} (${u.fullName}) - Role: ${u.role.name} - Permissions: ${u.role.permissions.length}`,
    );
  });
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
    await pool.end(); // Close the pool
  });
