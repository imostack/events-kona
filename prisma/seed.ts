import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // =====================
  // Categories
  // =====================
  const categories = [
    { name: "Music", slug: "music", icon: "Music", color: "#8b5cf6", sortOrder: 0 },
    { name: "Business", slug: "business", icon: "Briefcase", color: "#3b82f6", sortOrder: 1 },
    { name: "Food & Drink", slug: "food", icon: "UtensilsCrossed", color: "#f97316", sortOrder: 2 },
    { name: "Arts", slug: "arts", icon: "Palette", color: "#ec4899", sortOrder: 3 },
    { name: "Sports", slug: "sports", icon: "Trophy", color: "#22c55e", sortOrder: 4 },
    { name: "Technology", slug: "tech", icon: "Cpu", color: "#06b6d4", sortOrder: 5 },
    { name: "Education", slug: "education", icon: "GraduationCap", color: "#f59e0b", sortOrder: 6 },
    { name: "Religious", slug: "religious", icon: "Heart", color: "#f43f5e", sortOrder: 7 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} categories`);

  // =====================
  // Super Admin
  // =====================
  const adminPassword = await bcrypt.hash("Admin@123!", 12);
  await prisma.admin.upsert({
    where: { email: "admin@eventskona.com" },
    update: {},
    create: {
      email: "admin@eventskona.com",
      passwordHash: adminPassword,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      isActive: true,
      permissions: {
        users: ["create", "read", "update", "delete"],
        events: ["create", "read", "update", "delete"],
        analytics: ["read"],
        audit_logs: ["read"],
        admins: ["create", "read", "update", "delete"],
        settings: ["read", "update"],
      },
    },
  });
  console.log("Seeded super admin: admin@eventskona.com");

  // =====================
  // Settings: Currencies
  // =====================
  await prisma.setting.upsert({
    where: { key: "currencies" },
    update: {},
    create: {
      key: "currencies",
      value: [
        { code: "NGN", name: "Nigerian Naira", symbol: "\u20A6", enabled: true },
        { code: "GHS", name: "Ghanaian Cedi", symbol: "GH\u20B5", enabled: true },
        { code: "KES", name: "Kenyan Shilling", symbol: "KSh", enabled: true },
        { code: "USD", name: "US Dollar", symbol: "$", enabled: true },
        { code: "EUR", name: "Euro", symbol: "\u20AC", enabled: false },
        { code: "GBP", name: "British Pound", symbol: "\u00A3", enabled: false },
      ],
      description: "Supported platform currencies",
    },
  });
  console.log("Seeded currencies settings");

  // =====================
  // Settings: Validation Rules
  // =====================
  await prisma.setting.upsert({
    where: { key: "validation_rules" },
    update: {},
    create: {
      key: "validation_rules",
      value: {
        eventTitle: { minLength: 5, maxLength: 100 },
        eventDescription: { minLength: 20, maxLength: 5000 },
        ticketPrice: { min: 0, max: 10000000 },
        eventCapacity: { min: 1, max: 100000 },
      },
      description: "Validation rules for event creation",
    },
  });
  console.log("Seeded validation rules");

  // =====================
  // Settings: Platform Config
  // =====================
  await prisma.setting.upsert({
    where: { key: "platform" },
    update: {},
    create: {
      key: "platform",
      value: {
        serviceFeePercentage: 5.0,
        minPayoutAmount: 1000,
        defaultCurrency: "NGN",
        maintenanceMode: false,
      },
      description: "Platform configuration",
    },
  });
  console.log("Seeded platform settings");

  // =====================
  // Promotion Packages
  // =====================
  const packages = [
    {
      name: "Basic Boost",
      description: "Get your event noticed with basic promotion",
      features: [
        "Homepage featured (7 days)",
        "Email to 5,000 subscribers",
        "Social media post",
      ],
      duration: 7,
      price: 15000,
      currency: "NGN",
    },
    {
      name: "Premium",
      description: "Premium visibility for your event",
      features: [
        "Homepage featured (14 days)",
        "Email to 15,000 subscribers",
        "3 social media posts",
        "Priority search ranking",
        "Featured badge",
      ],
      duration: 14,
      price: 35000,
      currency: "NGN",
    },
    {
      name: "Ultimate",
      description: "Maximum exposure for your event",
      features: [
        "Homepage featured (30 days)",
        "Email to 30,000+ subscribers",
        "Daily social posts",
        "Top search ranking",
        "Dedicated account manager",
        "Custom marketing materials",
      ],
      duration: 30,
      price: 75000,
      currency: "NGN",
    },
  ];

  for (const pkg of packages) {
    await prisma.promotionPackage.upsert({
      where: { name: pkg.name },
      update: {},
      create: pkg,
    });
  }
  console.log(`Seeded ${packages.length} promotion packages`);

  console.log("Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
