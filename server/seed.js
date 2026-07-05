import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// ─── MongoDB connection ───────────────────────────────────────────────────────
const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://smartERP:smartERP123@cluster0.jdclnkg.mongodb.net/smarterp?retryWrites=true&w=majority&appName=Cluster0";

// ─── Inline model definitions (no circular imports) ──────────────────────────
const userSchema = new mongoose.Schema({
  fullName: String,
  username: String,
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const companySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  address: String,
  gstNumber: String,
  state: String,
  financialYear: String,
}, { timestamps: true });

const ledgerSchema = new mongoose.Schema({
  name: String,
  type: String,
  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  isSystem: { type: Boolean, default: false },
  companyId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const unitSchema = new mongoose.Schema({
  name: String,
  shortName: String,
  companyId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const stockGroupSchema = new mongoose.Schema({
  name: String,
  parentId: mongoose.Schema.Types.ObjectId,
  companyId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const stockItemSchema = new mongoose.Schema({
  name: String,
  sku: String,
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  gstRate: { type: Number, default: 18 },
  openingStock: { type: Number, default: 0 },
  currentStock: { type: Number, default: 0 },
  unitId: mongoose.Schema.Types.ObjectId,
  groupId: mongoose.Schema.Types.ObjectId,
  companyId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const salesVoucherItemSchema = new mongoose.Schema({
  itemId: mongoose.Schema.Types.ObjectId,
  quantity: Number,
  rate: Number,
  amount: Number,
}, { timestamps: true });

const salesVoucherSchema = new mongoose.Schema({
  invoiceNo: String,
  invoiceDate: Date,
  totalAmount: Number,
  companyId: mongoose.Schema.Types.ObjectId,
  customerId: mongoose.Schema.Types.ObjectId,
  items: [salesVoucherItemSchema],
}, { timestamps: true });

const purchaseItemSchema = new mongoose.Schema({
  itemId: mongoose.Schema.Types.ObjectId,
  quantity: Number,
  rate: Number,
  amount: Number,
}, { timestamps: true });

const purchaseSchema = new mongoose.Schema({
  voucherNo: String,
  date: Date,
  totalAmount: Number,
  companyId: mongoose.Schema.Types.ObjectId,
  supplierId: mongoose.Schema.Types.ObjectId,
  items: [purchaseItemSchema],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Company = mongoose.model('Company', companySchema);
const Ledger = mongoose.model('Ledger', ledgerSchema);
const Unit = mongoose.model('Unit', unitSchema);
const StockGroup = mongoose.model('StockGroup', stockGroupSchema);
const StockItem = mongoose.model('StockItem', stockItemSchema);
const SalesVoucher = mongoose.model('SalesVoucher', salesVoucherSchema);
const PurchaseVoucher = mongoose.model('PurchaseVoucher', purchaseSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ── 1. Create / find test user ─────────────────────────────────────────────
  const EMAIL = 'demo@smarterp.com';
  const PASSWORD = 'demo@1234';

  let user = await User.findOne({ email: EMAIL });
  if (user) {
    console.log('ℹ️  Demo user already exists, reusing it.');
  } else {
    const hashedPassword = await bcrypt.hash(PASSWORD, 12);
    user = await User.create({
      fullName: 'Demo User',
      username: 'demo',
      email: EMAIL,
      password: hashedPassword,
      role: 'admin',
    });
    console.log('✅ Demo user created');
  }

  const userId = user._id;

  // ── 2. Create / find company ───────────────────────────────────────────────
  let company = await Company.findOne({ userId, name: 'Labmentix Pvt Ltd' });
  if (!company) {
    company = await Company.create({
      userId,
      name: 'Labmentix Pvt Ltd',
      address: '42, MG Road, Bengaluru, Karnataka - 560001',
      gstNumber: '29AABCL1234M1Z5',
      state: 'Karnataka',
      financialYear: '2024-25',
    });
    console.log('✅ Demo company created');
  } else {
    console.log('ℹ️  Company already exists, reusing it.');
  }

  const cId = company._id;

  // ── 3. Unit ────────────────────────────────────────────────────────────────
  let unit = await Unit.findOne({ companyId: cId });
  if (!unit) {
    unit = await Unit.create({ name: 'Pieces', shortName: 'PCS', companyId: cId });
    console.log('✅ Unit created');
  }

  // ── 4. Stock Group ─────────────────────────────────────────────────────────
  let stockGroup = await StockGroup.findOne({ companyId: cId });
  if (!stockGroup) {
    stockGroup = await StockGroup.create({ name: 'Primary', companyId: cId });
    console.log('✅ Stock group created');
  }

  // ── 5. Stock Items (3) ────────────────────────────────────────────────────
  const itemDefs = [
    { name: 'Laptop Dell Inspiron 15', sku: 'LPT-001', purchasePrice: 45000, sellingPrice: 55000, gstRate: 18, openingStock: 20, currentStock: 18 },
    { name: 'HP Wireless Mouse', sku: 'MSE-002', purchasePrice: 800, sellingPrice: 1200, gstRate: 12, openingStock: 100, currentStock: 95 },
    { name: 'Samsung 27" Monitor', sku: 'MON-003', purchasePrice: 18000, sellingPrice: 22000, gstRate: 18, openingStock: 15, currentStock: 13 },
  ];

  const items = [];
  for (const def of itemDefs) {
    let item = await StockItem.findOne({ companyId: cId, sku: def.sku });
    if (!item) {
      item = await StockItem.create({ ...def, unitId: unit._id, groupId: stockGroup._id, companyId: cId });
    }
    items.push(item);
  }
  console.log('✅ Stock items ready');

  // ── 6. Customers (3) ──────────────────────────────────────────────────────
  const customerDefs = [
    { name: 'Infosys Ltd', openingBalance: 120000, currentBalance: 155000 },
    { name: 'Wipro Technologies', openingBalance: 85000, currentBalance: 110000 },
    { name: 'TCS (Tata Consultancy)', openingBalance: 200000, currentBalance: 235000 },
  ];

  const customers = [];
  for (const def of customerDefs) {
    let c = await Ledger.findOne({ companyId: cId, name: def.name, type: 'CUSTOMER' });
    if (!c) {
      c = await Ledger.create({ ...def, type: 'CUSTOMER', companyId: cId });
    }
    customers.push(c);
  }
  console.log('✅ Customers ready');

  // ── 7. Suppliers (3) ──────────────────────────────────────────────────────
  const supplierDefs = [
    { name: 'Dell India Pvt Ltd', openingBalance: 90000, currentBalance: 135000 },
    { name: 'HP India Ltd', openingBalance: 50000, currentBalance: 72000 },
    { name: 'Samsung Electronics India', openingBalance: 150000, currentBalance: 188000 },
  ];

  const suppliers = [];
  for (const def of supplierDefs) {
    let s = await Ledger.findOne({ companyId: cId, name: def.name, type: 'SUPPLIER' });
    if (!s) {
      s = await Ledger.create({ ...def, type: 'SUPPLIER', companyId: cId });
    }
    suppliers.push(s);
  }
  console.log('✅ Suppliers ready');

  // ── 8. Sales Vouchers (3) ─────────────────────────────────────────────────
  const saleDefs = [
    {
      invoiceNo: 'INV-2025-001',
      invoiceDate: new Date('2025-06-10'),
      customerId: customers[0]._id,
      items: [
        { itemId: items[0]._id, quantity: 2, rate: 55000, amount: 110000 },
        { itemId: items[1]._id, quantity: 5, rate: 1200, amount: 6000 },
      ],
      totalAmount: 116000,
    },
    {
      invoiceNo: 'INV-2025-002',
      invoiceDate: new Date('2025-06-18'),
      customerId: customers[1]._id,
      items: [
        { itemId: items[2]._id, quantity: 3, rate: 22000, amount: 66000 },
      ],
      totalAmount: 66000,
    },
    {
      invoiceNo: 'INV-2025-003',
      invoiceDate: new Date('2025-07-02'),
      customerId: customers[2]._id,
      items: [
        { itemId: items[0]._id, quantity: 1, rate: 55000, amount: 55000 },
        { itemId: items[2]._id, quantity: 2, rate: 22000, amount: 44000 },
      ],
      totalAmount: 99000,
    },
  ];

  for (const def of saleDefs) {
    const exists = await SalesVoucher.findOne({ companyId: cId, invoiceNo: def.invoiceNo });
    if (!exists) {
      await SalesVoucher.create({ ...def, companyId: cId });
    }
  }
  console.log('✅ Sales vouchers ready');

  // ── 9. Purchase Vouchers (3) ──────────────────────────────────────────────
  const purchaseDefs = [
    {
      voucherNo: 'PUR-2025-001',
      date: new Date('2025-06-05'),
      supplierId: suppliers[0]._id,
      items: [
        { itemId: items[0]._id, quantity: 5, rate: 45000, amount: 225000 },
      ],
      totalAmount: 225000,
    },
    {
      voucherNo: 'PUR-2025-002',
      date: new Date('2025-06-12'),
      supplierId: suppliers[1]._id,
      items: [
        { itemId: items[1]._id, quantity: 50, rate: 800, amount: 40000 },
      ],
      totalAmount: 40000,
    },
    {
      voucherNo: 'PUR-2025-003',
      date: new Date('2025-06-25'),
      supplierId: suppliers[2]._id,
      items: [
        { itemId: items[2]._id, quantity: 8, rate: 18000, amount: 144000 },
      ],
      totalAmount: 144000,
    },
  ];

  for (const def of purchaseDefs) {
    const exists = await PurchaseVoucher.findOne({ companyId: cId, voucherNo: def.voucherNo });
    if (!exists) {
      await PurchaseVoucher.create({ ...def, companyId: cId });
    }
  }
  console.log('✅ Purchase vouchers ready');

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════');
  console.log('🎉  SEED COMPLETE — Demo credentials for SmartERP');
  console.log('══════════════════════════════════════════════════');
  console.log('🌐  URL      : https://smart-erp-liard.vercel.app/');
  console.log('📧  Email    : demo@smarterp.com');
  console.log('🔑  Password : demo@1234');
  console.log('🏢  Company  : Labmentix Pvt Ltd');
  console.log('══════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
