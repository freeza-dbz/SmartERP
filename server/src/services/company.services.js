import { prisma } from "../db/index.js";
import { ApiError } from "../utils/ApiErrors.js";

const MAX_COMPANIES_PER_USER = 5;


const createCompany = async (companyData, userId) => {
    const companyCount = await prisma.company.count({
        where: {
            userId: userId,
        },
    });

    if (companyCount >= MAX_COMPANIES_PER_USER) {
        throw new ApiError(403, `A user can create a maximum of ${MAX_COMPANIES_PER_USER} companies.`);
    }

    const { name, address, gstNumber, state, financialYear } = companyData;

    return await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
            data: {
                name,
                address,
                gstNumber,
                state,
                financialYear,
                userId: userId,
            },
        });

        // Auto-seed default Unit
        await tx.unit.create({
            data: {
                name: "Pieces",
                shortName: "PCS",
                companyId: company.id,
            },
        });

        // Auto-seed default Stock Group
        await tx.stockGroup.create({
            data: {
                name: "Primary",
                companyId: company.id,
            },
        });

        return company;
    });
};


const getCompaniesByUserId = async (userId) => {
    return prisma.company.findMany({
        where: {
            userId: userId,
        },
    });
};


const updateCompany = async (companyId, updateData, userId) => {
    const company = await prisma.company.findFirst({
        where: {
            id: companyId,
            userId: userId,
        },
    });

    if (!company) {
        throw new ApiError(404, "Company not found or user not authorized.");
    }

    const { name, address, gstNumber, state, financialYear } = updateData;

    return prisma.company.update({
        where: {
            id: companyId,
        },
        data: {
            name,
            address,
            gstNumber,
            state,
            financialYear,
        },
    });
};


const deleteCompany = async (companyId, userId) => {
    const company = await prisma.company.findFirst({
        where: { id: companyId, userId: userId },
    });

    if (!company) {
        throw new ApiError(404, "Company not found or user not authorized.");
    }

    return prisma.company.delete({
        where: { id: companyId },
    });
};

export {
    createCompany,
    getCompaniesByUserId,
    updateCompany,
    deleteCompany
};