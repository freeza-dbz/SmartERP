import mongoose from 'mongoose';

const stockItemSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    maxlength: 100,
  },
  purchasePrice: {
    type: Number,
    default: 0,
  },
  sellingPrice: {
    type: Number,
    default: 0,
  },
  gstRate: {
    type: Number,
    default: 0,
  },
  openingStock: {
    type: Number,
    default: 0,
  },
  currentStock: {
    type: Number,
    default: 0,
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockGroup',
    required: true,
  },
}, {
  timestamps: true,
});

const StockItem = mongoose.model('StockItem', stockItemSchema);

export default StockItem;
