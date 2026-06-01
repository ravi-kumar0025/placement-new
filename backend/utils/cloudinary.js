import { v2 as cloudinary } from "cloudinary"           // ye v2 signature h
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, folder = "tpc-student-ids") => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder
        })
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)        //areee this is delete only
        }
        return response;

    } catch (error) {
        console.log("can not upload the file on cloudinary check CLOUDINARY.UTILS Error: ",error)
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return null;
    }
}

const deleteFromCloudinary = async (fileUrl) => {
    try {
        if (!fileUrl) return null;

        const uploadPath = fileUrl.split("/upload/").pop();
        const publicIdWithExtension = uploadPath.replace(/^v\d+\//, "");
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

        if (!publicId) return null;

        return await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto"
        });
    } catch (error) {
        console.log("can not delete the file from cloudinary check CLOUDINARY.UTILS", error)
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }
