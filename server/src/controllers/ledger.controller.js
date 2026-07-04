import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiErrors.js';
import Ledger from '../models/ledger.models.js';

const LedgerType = {
  CUSTOMER: 'CUSTOMER',
  SUPPLIER: 'SUPPLIER',
  BANK: 'BANK',
  CASH: 'CASH',
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE'
};

const createLedger = asyncHandler(async (req, res) => {
  const { name, type, openingBalance, companyId } = req.body;

  if (!name || !type || !companyId) {
    throw new ApiError(400, 'Name, type, and companyId are required');
  }

  if (!Object.values(LedgerType).includes(type)) {
    throw new ApiError(400, 'Invalid ledger type');
  }

  const newLedger = await Ledger.create({
    name,
    type,
    openingBalance: openingBalance || 0,
    currentBalance: openingBalance || 0,
    companyId: companyId,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201, 
        newLedger, 
        "Ledger created successfully"
      ));
});

const getLedgers = asyncHandler(async (req, res) => {
  const { companyId, type } = req.query;

  if (!companyId) {
    throw new ApiError(400, 'companyId query parameter is required');
  }

  const where = {
    companyId: companyId,
  };

  if (type && Object.values(LedgerType).includes(type)) {
    where.type = type;
  }

  const ledgers = await Ledger.find(where).sort({ name: 1 });
  return res.status(200).json(new ApiResponse(200, ledgers, "Ledgers fetched successfully"));
});

const updateLedger = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const updatedLedger = await Ledger.findByIdAndUpdate(id, data, { new: true });

  if (!updatedLedger) {
    throw new ApiError(404, 'Ledger not found');
  }

  return res.status(200).json(new ApiResponse(200, updatedLedger, "Ledger updated successfully"));
});

export {
  createLedger,
  getLedgers,
  updateLedger
}
