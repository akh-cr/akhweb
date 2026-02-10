"use client"

import { useState } from 'react'
import { Loader2, Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadImage } from '@/lib/storage'

interface GalleryUploadProps {
    value?: string[]
    onChange: (urls: string[]) => void
    disabled?: boolean
}

export function GalleryUpload({ value = [], onChange, disabled }: GalleryUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    const processFiles = async (files: File[]) => {
        if (!files || files.length === 0) return

        setIsUploading(true)
        try {
            const uploadedUrls: string[] = []

            // Process files sequentially to maintain order or parallel for speed?
            // Parallel is better for UX.
            const uploadPromises = files.map(async (file) => {
                const publicUrl = await uploadImage(file, {
                    bucket: 'images',
                    compression: {
                        maxSizeMB: 1, 
                        maxWidthOrHeight: 1920,
                        useWebWorker: true
                    }
                })
                
                return publicUrl
            })

            const results = await Promise.all(uploadPromises)
            onChange([...value, ...results])

        } catch (error) {
            console.error('Upload failed:', error)
            alert('Nahrávání selhalo. Zkuste to prosím znovu.')
        } finally {
            setIsUploading(false)
        }
    }

    const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) processFiles(files)
    }

    const onRemove = (urlToRemove: string) => {
        onChange(value.filter((url) => url !== urlToRemove))
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
        const files = Array.from(e.dataTransfer.files || [])
        if (files.length > 0) processFiles(files)
    }

    return (
        <div className="space-y-4">
            {/* Gallery Grid */}
            {value.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    {value.map((url, index) => (
                        <div key={url + index} className="relative group aspect-square rounded-xl overflow-hidden border bg-muted/30">
                            <Image
                                fill
                                src={url}
                                alt={`Gallery image ${index + 1}`}
                                className="object-cover transition-transform group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    type="button"
                                    onClick={() => onRemove(url)}
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Drop Zone */}
            <div className="w-full">
                <label 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
                        isDragging ? 'border-primary bg-primary/10 scale-[1.01]' : 'bg-muted/5 hover:bg-muted/20 border-muted-foreground/25',
                        (isUploading || disabled) ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
                    )}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        {isUploading ? (
                             <>
                                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                                <p className="text-sm text-foreground font-medium">Zpracovávám obrázky...</p>
                             </>
                        ) : (
                            <>
                                <div className={cn("p-3 rounded-full mb-2 transition-colors", isDragging ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground')}>
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                                <p className="mb-1 text-sm text-foreground font-medium">
                                    {isDragging ? "Sem přetáhněte obrázky" : "Přidat další fotky"}
                                </p>
                                <p className="text-xs text-muted-foreground">Vyberte více souborů najednou</p>
                            </>
                        )}
                    </div>
                    <input 
                        type="file" 
                        multiple
                        className="hidden" 
                        accept="image/png, image/jpeg, image/jpg, image/webp" 
                        onChange={onUpload} 
                        disabled={isUploading || disabled} 
                    />
                </label>
            </div>
        </div>
    )
}
