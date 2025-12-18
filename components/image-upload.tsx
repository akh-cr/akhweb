"use client"

import { useState } from 'react'
import { createClient } from "@/lib/supabase/client"
import imageCompression from 'browser-image-compression'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const supabase = createClient()

    const processFile = async (file: File) => {
        if (!file) return

        setIsLoading(true)
        try {
            // Compress
            const options = {
                maxSizeMB: 1, // Increased to 1MB result for better quality
                maxWidthOrHeight: 1920, // Increased for better resolution
                useWebWorker: true
            }
            const compressedFile = await imageCompression(file, options)

            // Upload
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
            const filePath = `uploads/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, compressedFile)

            if (uploadError) {
                console.error("Supabase storage error:", uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath)

            onChange(publicUrl)
        } catch (error) {
            console.error('Upload failed:', error)
            alert('Nahrávání selhalo. Zkuste to prosím znovu.')
        } finally {
            setIsLoading(false)
        }
    }

    const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) processFile(file)
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) processFile(file)
    }

    if (value) {
        return (
            <div className="relative w-full h-64 rounded-xl overflow-hidden border bg-muted/30">
                <Image 
                    fill 
                    src={value} 
                    alt="Uploaded image" 
                    className="object-cover" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <button
                    onClick={() => onChange('')}
                    className="absolute top-2 right-2 bg-destructive/90 text-white p-1.5 rounded-full hover:bg-destructive transition-colors shadow-sm z-10"
                    type="button"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        )
    }

    return (
        <div className="w-full">
            <label 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                    ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'bg-muted/5 hover:bg-muted/20 border-muted-foreground/25'}
                    ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
                `}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    {isLoading ? (
                         <>
                            <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                            <p className="text-sm text-foreground font-medium">Optimalizuji a nahrávám...</p>
                         </>
                    ) : (
                        <>
                            <div className={`p-4 rounded-full mb-3 transition-colors ${isDragging ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="mb-2 text-sm text-foreground font-medium">
                                {isDragging ? "Sem přetáhněte obrázek" : "Klikněte nebo přetáhněte obrázek sem"}
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG (bez limitu velikosti, auto komprese)</p>
                        </>
                    )}
                </div>
                <input 
                    type="file" 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/jpg, image/webp" 
                    onChange={onUpload} 
                    disabled={isLoading || disabled} 
                />
            </label>
        </div>
    )
}
