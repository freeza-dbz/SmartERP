import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean database
  await prisma.salesVoucherItem.deleteMany({});
  await prisma.salesVoucher.deleteMany({});
  await prisma.purchaseVoucherItem.deleteMany({});
  await prisma.purchaseVoucher.deleteMany({});
  await prisma.stockItem.deleteMany({});
  await prisma.unit.deleteMany({});
  await prisma.stockGroup.deleteMany({});
  await prisma.ledger.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create User
  const hashedPassword = await bcrypt.hash("Password123", 10);
  const user = await prisma.user.create({
    data: {
      fullName: "Test Admin",
      email: "test@company.com",
      password: hashedPassword,
      username: "testadmin",
    },
  });
  console.log(`Created user: ${user.email}`);

  // 2. Create Company
  const company = await prisma.company.create({
    data: {
      name: "SmartERP Solutions Pvt Ltd",
      address: "456 Tech Park, Sector 62",
      gstNumber: "27AABCT1234M1Z5",
      state: "Maharashtra",
      financialYear: "2024-2025",
      userId: user.id,
    },
  });
  console.log(`Created company: ${company.name}`);

  // 3. Create Unit
  const unitPcs = await prisma.unit.create({
    data: {
      name: "Pieces",
      shortName: "PCS",
      companyId: company.id,
    },
  });

  const unitKg = await prisma.unit.create({
    data: {
      name: "Kilograms",
      shortName: "KG",
      companyId: company.id,
    },
  });
  console.log("Created units (PCS, KG)");

  // 4. Create Stock Group
  const groupElectronics = await prisma.stockGroup.create({
    data: {
      name: "Electronics",
      companyId: company.id,
    },
  });

  const groupAccessories = await prisma.stockGroup.create({
    data: {
      name: "Accessories",
      companyId: company.id,
    },
  });
  console.log("Created stock groups (Electronics, Accessories)");

  // 5. Create Ledgers (Customers & Suppliers)
  const cust1 = await prisma.ledger.create({
    data: {
      name: "Acme Corporates",
      type: "CUSTOMER",
      openingBalance: 15000.0,
      currentBalance: 15000.0,
      companyId: company.id,
    },
  });

  const cust2 = await prisma.ledger.create({
    data: {
      name: "Zenith Retailers",
      type: "CUSTOMER",
      openingBalance: 7200.0,
      currentBalance: 7200.0,
      companyId: company.id,
    },
  });

  const supp1 = await prisma.ledger.create({
    data: {
      name: "Global Tech Distributors",
      type: "SUPPLIER",
      openingBalance: 25000.0,
      currentBalance: 25000.0,
      companyId: company.id,
    },
  });

  const supp2 = await prisma.ledger.create({
    data: {
      name: "Nexus Components Inc",
      type: "SUPPLIER",
      openingBalance: 12000.0,
      currentBalance: 12000.0,
      companyId: company.id,
    },
  });
  console.log("Created ledgers (Customers & Suppliers)");

  // 6. Create Stock Items
  const item1 = await prisma.stockItem.create({
    data: {
      name: "Dell UltraSharp 24 Monitor",
      sku: "DELL-U2424",
      purchasePrice: 12000.00,
      sellingPrice: 16500.00,
      gstRate: 18,
      openingStock: 25.00,
      currentStock: 25.00,
      unitId: unitPcs.id,
      groupId: groupElectronics.id,
      companyId: company.id,
    },
  });

  const item2 = await prisma.stockItem.create({
    data: {
      name: "Logitech MX Master 3S Mouse",
      sku: "LOGI-MX3S",
      purchasePrice: 6000.00,
      sellingPrice: 8500.00,
      gstRate: 18,
      openingStock: 40.00,
      currentStock: 40.00,
      unitId: unitPcs.id,
      groupId: groupAccessories.id,
      companyId: company.id,
    },
  });

  const item3 = await prisma.stockItem.create({
    data: {
      name: "Keychron K2 Mechanical Keyboard",
      sku: "KEY-K2-V2",
      purchasePrice: 5500.00,
      sellingPrice: 7500.00,
      gstRate: 18,
      openingStock: 15.00,
      currentStock: 15.00,
      unitId: unitPcs.id,
      groupId: groupAccessories.id,
      companyId: company.id,
    },
  });
  console.log("Created stock items");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
