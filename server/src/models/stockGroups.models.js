import mongoose from 'mongoose';

const stockGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockGroup',
    default: null,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
}, {
  timestamps: true,
});

const StockGroup = mongoose.model('StockGroup', stockGroupSchema);

export default StockGroup;
