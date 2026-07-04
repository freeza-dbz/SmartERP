import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 255,
  },
  address: {
    type: String,
  },
  gstNumber: {
    type: String,
    maxlength: 20,
  },
  state: {
    type: String,
    maxlength: 100,
  },
  financialYear: {
    type: String,
    required: true,
    maxlength: 20,
  },
}, {
  timestamps: true,
});

const Company = mongoose.model('Company', companySchema);

export default Company;
