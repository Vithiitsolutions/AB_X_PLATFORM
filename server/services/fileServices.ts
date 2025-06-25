import mercury from "@mercury-js/core";
import axios, { AxiosResponse } from "axios";
import express from "express";
import FormData from "form-data";
import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express";
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
interface UploadFile {
    name: string;
    data: Buffer;
    size: number;
    mimetype: string;
}

interface ApiMultiUploadResponse {
    objects: Array<{ key: string }>;
}

interface SignedUrlResponse {
    path: string;
}

const router = express.Router();
const BASE_URL = "https://assets.mercuryx.cloud/sandbox";
const API_KEY = process.env.API_KEY;
const APP_SECRET = process.env.APP_SECRET || "";

// File size limits (in bytes)
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB per file
const MAX_TOTAL_SIZE = 1024 * 1024 * 1024; // 1GB total for multi-upload

const SUPPORTED_MIME_TYPES = {
    IMAGE: 'image/',
    VIDEO: 'video/',
    PDF: 'application/pdf'
} as const;

const FILE_TYPES = {
    IMAGE: 'image',
    VIDEO: 'video',
    PDF: 'pdf',
    OTHER: 'other'
} as const;

const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith(SUPPORTED_MIME_TYPES.IMAGE)) return FILE_TYPES.IMAGE;
    if (mimeType.startsWith(SUPPORTED_MIME_TYPES.VIDEO)) return FILE_TYPES.VIDEO;
    if (mimeType === SUPPORTED_MIME_TYPES.PDF) return FILE_TYPES.PDF;
    return FILE_TYPES.OTHER;
};
// Optimized signed URL creation with caching potential
const createSignedUrl = async (key: string): Promise<string> => {
    const startTime = Date.now();
    console.log(`Creating signed URL for key: ${key}`);
    const formData = new FormData();
    formData.append("key", key);
    formData.append("eat", "-1");
    try {
        const response: AxiosResponse<SignedUrlResponse> = await axios.post(
            `${BASE_URL}/get-signed-url`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    "x-api-key": API_KEY || "",
                    "Authorization": encryptJson(APP_SECRET),
                },
                maxBodyLength: MAX_FILE_SIZE,
                maxContentLength: MAX_FILE_SIZE,
                timeout: 30000, // 30 second timeout for signed URL
            }
        );
        if (!response.data?.path) {
            throw new Error("Failed to retrieve signed URL");
        }
        const endTime = Date.now();
        console.log(`Signed URL created in ${endTime - startTime}ms`);
        return `https://assets.mercuryx.cloud${response.data.path}`;
    } catch (error) {
        console.error(`Signed URL creation failed for key ${key}:`, error);
        throw error;
    }
};
const getAxiosHeaders = (formData?: FormData) => ({
    ...(formData ? formData.getHeaders() : {}),
    "x-api-key": API_KEY || "",
    "Authorization": encryptJson(APP_SECRET),
});
// Helper function with optimized timeouts based on file size
const getAxiosConfig = (formData?: FormData, fileSize: number = 0) => {
    // Dynamic timeout based on file size (minimum 30s, +10s per 10MB)
    const baseTimeout = 30000;
    const additionalTimeout = Math.floor(fileSize / (10 * 1024 * 1024)) * 10000;
    const timeout = Math.min(baseTimeout + additionalTimeout, 600000); // Max 10 minutes
    return {
        headers: getAxiosHeaders(formData),
        timeout,
        maxBodyLength: MAX_TOTAL_SIZE,
        maxContentLength: MAX_TOTAL_SIZE,
    };
};
// Progress tracking middleware
const trackUploadProgress = (req: Request, res: Response, next: any) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`Upload completed in ${duration}ms`);
    });
    next();
};
// Optimized multiple file upload
router.post("/multi-upload", trackUploadProgress, async (req: Request, res: Response) => {
    const uploadStartTime = Date.now();
    try {
        if (!req.files?.files) {
            return res.status(400).json({
                success: false,
                error: "No files uploaded"
            });
        }
        const { path } = req.body;
        if (!path) {
            return res.status(400).json({
                success: false,
                error: "Path is required"
            });
        }
        const files: UploadFile[] = Array.isArray(req.files.files)
            ? req.files.files
            : [req.files.files];
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        // Validation
        if (totalSize > MAX_TOTAL_SIZE) {
            return res.status(400).json({
                success: false,
                error: `Total file size (${(totalSize / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of ${MAX_TOTAL_SIZE / (1024 * 1024)}MB`
            });
        }
        const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
        if (oversizedFiles.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Files exceed individual size limit: ${oversizedFiles.map(f => f.name).join(', ')}`
            });
        }
        // Prepare form data
        const formData = new FormData();
        formData.append("path", path);
        files.forEach((file: UploadFile) => {
            formData.append("files", file.data, {
                filename: file.name,
                contentType: file.mimetype,
            });
        });
        // Upload with dynamic timeout based on total size
        const uploadApiStartTime = Date.now();
        const uploadResponse: AxiosResponse<ApiMultiUploadResponse> = await axios.post(
            `${BASE_URL}/multi-upload`,
            formData,
            getAxiosConfig(formData, totalSize)
        );
        const uploadApiEndTime = Date.now();
        console.log(`Multi-upload API completed in ${uploadApiEndTime - uploadApiStartTime}ms`);
        if (!uploadResponse.data?.objects || !Array.isArray(uploadResponse.data.objects)) {
            return res.status(500).json({
                success: false,
                error: "Invalid response from upload API"
            });
        }
        // Process files with better concurrency control
        const processingStartTime = Date.now();
        const uploadResults = await Promise.allSettled(
            files.map(async (file, index) => {
                const uploadedFile = uploadResponse.data.objects[index];
                if (!uploadedFile?.key) {
                    throw new Error("No upload metadata found");
                }
                // Process signed URL and DB save in parallel where possible
                const fileType = getFileType(file.mimetype);
                const signedPath = await createSignedUrl(uploadedFile.key);
                return await mercury.db.File.create(
                    {
                        name: file.name,
                        path: path,
                        size: file.size,
                        mimeType: file.mimetype,
                        location: signedPath,
                        type: fileType,
                    },
                    { id: "1", profile: "SystemAdmin" }
                );
            })
        );
        const processingEndTime = Date.now();
        console.log(`Database processing completed in ${processingEndTime - processingStartTime}ms`);
        // Format the results
        const successfulUploads = uploadResults
            .filter(result => result.status === "fulfilled")
            .map(result => (result as PromiseFulfilledResult<any>).value);
        const failedUploads = uploadResults
            .filter(result => result.status === "rejected")
            .map((result, idx) => ({
                name: files[idx].name,
                error: (result as PromiseRejectedResult).reason?.message || "Unknown error"
            }));
        const totalTime = Date.now() - uploadStartTime;
        console.log(`Total multi-upload process completed in ${totalTime}ms`);
        return res.status(200).json({
            success: true,
            message: "Multi-file upload completed",
            totalFiles: files.length,
            successful: successfulUploads.length,
            failed: failedUploads.length,
            files: successfulUploads,
            errors: failedUploads,
            uploadTime: `${totalTime}ms`,
            totalSize: `${(totalSize / (1024 * 1024)).toFixed(2)}MB`
        });
    } catch (error) {
        const totalTime = Date.now() - uploadStartTime;
        console.error(`Multi-upload failed after ${totalTime}ms:`, error);
        return res.status(500).json({
            success: false,
            error: "Multi-file upload failed",
            details: error instanceof Error ? error.message : "Unknown error",
            uploadTime: `${totalTime}ms`
        });
    }
});
export const FileMethods = router;
export function encryptJson(secretKey: string) {
    const jsonData1 = { eat: Math.floor(Date.now() / 1000) + 600 }
    const token = jwt.sign(JSON.stringify(jsonData1), secretKey, { algorithm: 'HS256' });
    return token;
}

