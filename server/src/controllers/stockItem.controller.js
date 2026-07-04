import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiErrors.js';
import StockItem from '../models/stockItem.models.js';

/**
 * Create a new Stock Item
 * @route POST /api/v1/items
 */
const createStockItem = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    purchasePrice,
    sellingPrice,
    gstRate,
    openingStock,
    unitId,
    groupId,
    companyId,
  } = req.body;

  if (!name || !unitId || !groupId || !companyId) {
    throw new ApiError(400, 'Name, unitId, groupId, and companyId are required');
  }

  const newItem = await StockItem.create({
    name,
    sku,
    purchasePrice,
    sellingPrice,
    gstRate,
    openingStock,
    currentStock: openingStock, // Initialize currentStock with openingStock
    unitId,
    groupId,
    companyId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newItem, 'Stock item created successfully'));
});

/**
 * Get all Stock Items for a company
 * @route GET /api/v1/items
 */
const getStockItems = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    throw new ApiError(400, 'companyId query parameter is required');
  }

  const items = await StockItem.find({ companyId })
    .populate('unitId')
    .populate('groupId')
    .sort({ name: 1 });

  // Map populated fields to match old Prisma structure if frontend depends on it
  const formattedItems = items.map(item => {
    const doc = item.toObject();
    doc.unit = doc.unitId;
    doc.stockGroup = doc.groupId;
    doc.id = doc._id;
    return doc;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, formattedItems, 'Stock items fetched successfully'));
});

/**
 * Update a Stock Item
 * @route PUT /api/v1/items/:id
 */
const updateStockItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const updatedItem = await StockItem.findByIdAndUpdate(id, data, { new: true });

  if (!updatedItem) {
    throw new ApiError(404, 'Stock item not found');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedItem, 'Stock item updated successfully')
    );
});

export { createStockItem, getStockItems, updateStockItem };