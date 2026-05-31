
import { PastRecruiter } from "../models/index.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const buildRecruiterPayload = async (req) => {
    const payload = {};

    const { name, industry, tier } = req.body;

    if (name !== undefined) payload.name = name;
    if (industry !== undefined) payload.industry = industry;
    if (tier !== undefined) payload.tier = tier;

    if (req.file?.path) {
        const cloudinaryResponse = await uploadOnCloudinary(
            req.file.path,
            "tpc-recruiter-logos"
        );

        if (!cloudinaryResponse?.url) {
            throw new Error("Failed to upload recruiter logo.");
        }

        payload.logoUrl = cloudinaryResponse.url;
    }
    return payload;
};

const getPastRecruiters = async (req, res) => {
    try {
        const recruiters = await PastRecruiter.find()
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            count: recruiters.length,
            data: recruiters
        });

    } catch (error) {
        console.error("getPastRecruiters Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch recruiters."
        });
    }
};

const createPastRecruiter = async (req, res) => {
    try {
        const recruiterPayload = await buildRecruiterPayload(req);

        const recruiter = await PastRecruiter.create(
            recruiterPayload
        );

        return res.status(201).json({
            success: true,
            data: recruiter
        });

    } catch (error) {
        console.error("createPastRecruiter Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updatePastRecruiter = async (req, res) => {
    try {
        const { id } = req.params;

        const recruiterPayload = await buildRecruiterPayload(req);

        const recruiter = await PastRecruiter.findByIdAndUpdate(
            id,
            recruiterPayload,
            {
                new: true,
                runValidators: true
            }
        );

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: recruiter
        });

    } catch (error) {
        console.error("updatePastRecruiter Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deletePastRecruiter = async (req, res) => {
    try {
        const { id } = req.params;

        const recruiter = await PastRecruiter.findByIdAndDelete(id);

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Recruiter deleted successfully."
        });

    } catch (error) {
        console.error("deletePastRecruiter Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete recruiter."
        });
    }
};

const pastRecruiterController = {
    getPastRecruiters,
    createPastRecruiter,
    updatePastRecruiter,
    deletePastRecruiter,
}
export default pastRecruiterController