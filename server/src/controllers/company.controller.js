import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import {
    createCompany,
    getCompaniesByUserId,
    updateCompany,
    deleteCompany,
} from "../services/company.services.js";

const createCompanyHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const company = await createCompany(req.body, userId);

    return res
        .status(201)
        .json(new ApiResponse(201, company, "Company created successfully"));
});

const getCompaniesHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const companies = await getCompaniesByUserId(userId);

    return res
        .status(200)
        .json(new ApiResponse(200, companies, "Companies fetched successfully"));
});

const updateCompanyHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const companyId = req.params.id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new ApiError(400, "Invalid company ID");
    }

    const updatedCompany = await updateCompany(companyId, req.body, userId);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedCompany, "Company updated successfully"));
});

const deleteCompanyHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const companyId = req.params.id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new ApiError(400, "Invalid company ID");
    }

    await deleteCompany(companyId, userId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Company deleted successfully"));
});

export {
    createCompanyHandler,
    getCompaniesHandler,
    updateCompanyHandler,
    deleteCompanyHandler,
};