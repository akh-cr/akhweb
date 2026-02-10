import { createClient } from "@/lib/supabase/client"
import imageCompression from 'browser-image-compression'

export interface UploadImageOptions {
    bucket?: string
    folder?: string
    compression?: {
        maxSizeMB?: number
        maxWidthOrHeight?: number
        useWebWorker?: boolean
    }
}

/**
 * Uploads an image to Supabase Storage with automatic compression and unique filename.
 * @param file The file to upload
 * @param options Configuration options
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(file: File, options: UploadImageOptions = {}): Promise<string> {
    const supabase = createClient()
    const bucket = options.bucket || 'images'
    
    // Default compression settings
    const compressionConfig = options.compression || {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
    }

    try {
        // Compress
        const compressedFile = await imageCompression(file, compressionConfig)

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const folder = options.folder || 'uploads'
        // Remove trailing slash if present in folder
        const cleanFolder = folder.endsWith('/') ? folder.slice(0, -1) : folder
        const filePath = `${cleanFolder}/${fileName}`

        // Upload
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, compressedFile)

        if (uploadError) {
            console.error("Supabase storage error:", uploadError);
            throw uploadError;
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

        return publicUrl
    } catch (error) {
        console.error("Upload utility failed:", error)
        throw error
    }
}
