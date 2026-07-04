import mongoose from 'mongoose';

const purchaseVoucherItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockItem',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
  }
}, {
  timestamps: true,
});

const purchaseVoucherSchema = new mongoose.Schema({
  voucherNo: {
    type: String,
    required: true,
    maxlength: 50,
  },
  date: {
    type: Date,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true,
  },
  items: [purchaseVoucherItemSchema]
}, {
  timestamps: true,
});

const PurchaseVoucher = mongoose.model('PurchaseVoucher', purchaseVoucherSchema);

export default PurchaseVoucher;
