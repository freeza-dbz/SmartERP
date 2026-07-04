import mongoose from 'mongoose';

const ledgerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'CUSTOMER',
      'SUPPLIER',
      'BANK',
      'CASH',
      'ASSET',
      'LIABILITY',
      'INCOME',
      'EXPENSE'
    ],
  },
  openingBalance: {
    type: Number,
    default: 0,
  },
  currentBalance: {
    type: Number,
    default: 0,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
}, {
  timestamps: true,
});

const Ledger = mongoose.model('Ledger', ledgerSchema);

export default Ledger;
