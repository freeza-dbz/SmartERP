import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiErrors.js';

const prisma = new PrismaClient();

const createStockGroup = asyncHandler(async (req, res) => {
  const { name, parentId, companyId } = req.body;

  if (!name || !companyId) {
    throw new ApiError(400, 'Name and companyId are required');
  }

  const newGroup = await prisma.stockGroup.create({
    data: {
      name,
      companyId,
      parentId, // Can be null for top-level groups
    },
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

  const allGroups = await prisma.stockGroup.findMany({
    where: { companyId: parseInt(companyId) },
    orderBy: { name: 'asc' },
  });

  // Build a tree structure from the flat list of groups
  const groupMap = new Map();
  allGroups.forEach(group => groupMap.set(group.id, { ...group, children: [] }));

  const tree = [];
  allGroups.forEach(group => {
    if (group.parentId) {
      const parent = groupMap.get(group.parentId);
      if (parent) {
        parent.children.push(groupMap.get(group.id));
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