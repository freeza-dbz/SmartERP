import mongoose from 'mongoose';

const salesVoucherItemSchema = new mongoose.Schema({
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

const salesVoucherSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    required: true,
    maxlength: 50,
  },
  invoiceDate: {
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
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true,
  },
  items: [salesVoucherItemSchema]
}, {
  timestamps: true,
});

const SalesVoucher = mongoose.model('SalesVoucher', salesVoucherSchema);

export default SalesVoucher;
