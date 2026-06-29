import { PrismaClient, LedgerType } from '@prisma/client';

const prisma = new PrismaClient();

exports.createLedger = async (req, res) => {
  try {
    const { name, type, openingBalance, companyId } = req.body;

    if (!name || !type || !companyId) {
      return res.status(400).json({ error: 'Name, type, and companyId are required' });
    }

    if (!Object.values(LedgerType).includes(type)) {
      return res.status(400).json({ error: 'Invalid ledger type' });
    }

    const newLedger = await prisma.ledger.create({
      data: {
        name,
        type,
        openingBalance: openingBalance || 0,
        currentBalance: openingBalance || 0, // Initially, current balance is the same as opening
        company: {
          connect: { id: companyId },
        },
      },
    });
    res.status(201).json(newLedger);
  } catch (error) {
    console.error('Error creating ledger:', error);
    res.status(500).json({ error: 'Failed to create ledger' });
  }
};

exports.getLedgers = async (req, res) => {
  try {
    const { companyId, type } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId query parameter is required' });
    }

    const where = {
      companyId: parseInt(companyId),
    };

    if (type && Object.values(LedgerType).includes(type)) {
      where.type = type;
    }

    const ledgers = await prisma.ledger.findMany({ where, orderBy: { name: 'asc' } });
    res.status(200).json(ledgers);
  } catch (error) {
    console.error('Error fetching ledgers:', error);
    res.status(500).json({ error: 'Failed to fetch ledgers' });
  }
};

exports.updateLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedLedger = await prisma.ledger.update({
      where: { id: parseInt(id) },
      data,
    });
    res.status(200).json(updatedLedger);
  } catch (error) {
    console.error(`Error updating ledger with id ${req.params.id}:`, error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Ledger not found' });
    }
    res.status(500).json({ error: 'Failed to update ledger' });
  }
};