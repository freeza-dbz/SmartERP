import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  shortName: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Unit = mongoose.model('Unit', unitSchema);

export default Unit;
