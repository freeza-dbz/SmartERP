import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiErrors.js';
import StockGroup from '../models/stockGroups.models.js';

const createStockGroup = asyncHandler(async (req, res) => {
  const { name, parentId, companyId } = req.body;

  if (!name || !companyId) {
    throw new ApiError(400, 'Name and companyId are required');
  }

  const newGroup = await StockGroup.create({
    name,
    companyId,
    parentId: parentId || null,
  });
  
  return res.status(201).json(
    new ApiResponse(201, newGroup, "Stock group created successfully")
  );
});

const getStockGroups = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    throw new ApiError(400, 'companyId query parameter is required');
  }

  const allGroups = await StockGroup.find({ companyId }).sort({ name: 1 }).lean();

  // Build a tree structure from the flat list of groups
  const groupMap = new Map();
  allGroups.forEach(group => {
    group.id = group._id.toString();
    groupMap.set(group.id, { ...group, children: [] })
  });

  const tree = [];
  allGroups.forEach(group => {
    if (group.parentId) {
      const parent = groupMap.get(group.parentId.toString());
      if (parent) {
        parent.children.push(groupMap.get(group.id));
      } else {
        tree.push(groupMap.get(group.id));
      }
    } else {
      tree.push(groupMap.get(group.id));
    }
  });

  return res.status(200).json(new ApiResponse(200, tree, "Stock groups fetched successfully"));
});

export {
  createStockGroup,
  getStockGroups
}