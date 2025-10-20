import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// Helper to upload buffer directly to Cloudinary
export async function uploadBufferToCloudinary(
    buffer: Buffer,
    resourceType: "image" | "video" | "auto" = "auto",
    folder?: string
) {
    return new Promise((resolve, reject) => {
        const options: { resource_type: "image" | "video" | "auto"; folder?: string } = { resource_type: resourceType };
        if (folder) options.folder = folder;
        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
}

export default cloudinary;
