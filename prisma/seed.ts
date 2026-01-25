import bcrypt from "bcryptjs";
// import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { v4 as uuidv4 } from "uuid";
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
  console.log("🌱 Starting seed...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  // Test connection
  await prisma.$connect();
  console.log("✅ Database connected");

  //roles
  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: {
      name: "USER",
      description: "Regular user with basic access",
    },
  });
  console.log(`✅ Role: ${userRole.name}`);

  const moderatorRole = await prisma.role.upsert({
    where: { name: "MODERATOR" },
    update: {},
    create: {
      name: "MODERATOR",
      description: "Moderator with elevated permissions",
    },
  });
  console.log(`✅ Role: ${moderatorRole.name}`);

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Administrator with full access",
    },
  });
  console.log(`✅ Role: ${adminRole.name}`);

  // Step 2: Seed Users
  console.log("\n👥 Seeding Users...");

  const password = await bcrypt.hash("Password123", 10);
  console.log("✅ Password hashed");

  const users = [
    {
      id: uuidv4(),
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      fullName: "Admin User",
      phoneNumber: "+1234567890",
      password,
    },
    {
      id: uuidv4(),
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      phoneNumber: "+1234567890",
      password,
    },
    {
      id: uuidv4(),
      email: "kyle@gmail.com",
      firstName: "Kyle",
      lastName: "Manuel",
      fullName: "Kyle Manuel",
      phoneNumber: "+1234567890",
      password,
    },
  ];

  console.log(`🔄 Upserting ${users.length} users...`);

  for (const user of users) {
    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      // create: user,
      create: {
        ...user,
        roleId: userRole.id, // 👈 REQUIRED
      },
    });
    console.log(`  ✅ ${result.email} (${result.id})`);
  }

  // Verify
  const count = await prisma.user.count();
  console.log(`\n✅ Seeding complete! Total users: ${count}`);

  // List all users
  const allUsers = await prisma.user.findMany();
  console.log("\n📋 All users:");
  allUsers.forEach((u) => console.log(`  - ${u.email} (${u.fullName})`));
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("\n🔌 Disconnecting...");
    await prisma.$disconnect();
    await pool.end(); // Close the pool
  });
