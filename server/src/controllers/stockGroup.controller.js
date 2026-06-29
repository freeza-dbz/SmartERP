const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create a new Stock Group
 * @route POST /api/groups
 */
exports.createStockGroup = async (req, res) => {
  try {
    const { name, parentId, companyId } = req.body;

    if (!name || !companyId) {
      return res.status(400).json({ error: 'Name and companyId are required' });
    }

    const newGroup = await prisma.stockGroup.create({
      data: {
        name,
        companyId,
        parentId, // Can be null for top-level groups
      },
    });
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating stock group:', error);
    res.status(500).json({ error: 'Failed to create stock group' });
  }
};

/**
 * Get all Stock Groups for a company (hierarchically)
 * @route GET /api/groups
 */
exports.getStockGroups = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId query parameter is required' });
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
        groupMap.get(group.parentId)?.children.push(groupMap.get(group.id));
      } else {
        tree.push(groupMap.get(group.id));
      }
    });

    res.status(200).json(tree);
  } catch (error) {
    console.error('Error fetching stock groups:', error);
    res.status(500).json({ error: 'Failed to fetch stock groups' });
  }
};