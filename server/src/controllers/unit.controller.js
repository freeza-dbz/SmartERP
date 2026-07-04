import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiErrors.js';
import Unit from '../models/unit.models.js';

/**
 * Create a new Unit
 * @route POST /api/v1/units
 */
const createUnit = asyncHandler(async (req, res) => {
  const { name, shortName, companyId } = req.body;

  if (!name || !shortName || !companyId) {
    throw new ApiError(400, 'Name, shortName, and companyId are required');
  }

  const newUnit = await Unit.create({
    name,
    shortName,
    companyId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newUnit, 'Unit created successfully'));
});

/**
 * Get all Units for a company
 * @route GET /api/v1/units
 */
const getUnits = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    throw new ApiError(400, 'companyId query parameter is required');
  }

  const units = await Unit.find({ companyId }).sort({ name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, units, 'Units fetched successfully'));
});

export { createUnit, getUnits };