import mongoose from "mongoose";
import Company from "../models/company.model.js";
import Unit from "../models/unit.models.js";
import StockGroup from "../models/stockGroups.models.js";
import { ApiError } from "../utils/ApiErrors.js";

const MAX_COMPANIES_PER_USER = 5;

const createCompany = async (companyData, userId) => {
    const companyCount = await Company.countDocuments({
        userId: userId,
    });

    if (companyCount >= MAX_COMPANIES_PER_USER) {
        throw new ApiError(403, `A user can create a maximum of ${MAX_COMPANIES_PER_USER} companies.`);
    }

    const { name, address, gstNumber, state, financialYear } = companyData;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const companyArr = await Company.create([{
            name,
            address,
            gstNumber,
            state,
            financialYear,
            userId: userId,
        }], { session });

        const company = companyArr[0];

        // Auto-seed default Unit
        await Unit.create([{
            name: "Pieces",
            shortName: "PCS",
            companyId: company._id,
        }], { session });

        // Auto-seed default Stock Group
        await StockGroup.create([{
            name: "Primary",
            companyId: company._id,
        }], { session });

        await session.commitTransaction();
        return company;
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(500, error.message || "Failed to create company");
    } finally {
        session.endSession();
    }
};


const getCompaniesByUserId = async (userId) => {
    return Company.find({
        userId: userId,
    });
};


const updateCompany = async (companyId, updateData, userId) => {
    const company = await Company.findOne({
        _id: companyId,
        userId: userId,
    });

    if (!company) {
        throw new ApiError(404, "Company not found or user not authorized.");
    }

    const { name, address, gstNumber, state, financialYear } = updateData;

    return Company.findByIdAndUpdate(
        companyId,
        {
            name,
            address,
            gstNumber,
            state,
            financialYear,
        },
        { new: true }
    );
};


const deleteCompany = async (companyId, userId) => {
    const company = await Company.findOne({
        _id: companyId,
        userId: userId,
    });

    if (!company) {
        throw new ApiError(404, "Company not found or user not authorized.");
    }

    return Company.findByIdAndDelete(companyId);
};

export {
    createCompany,
    getCompaniesByUserId,
    updateCompany,
    deleteCompany
};