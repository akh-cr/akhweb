"use client"

import { useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { uploadImageAction } from '@/lib/actions/upload-image'
import imageCompression from 'browser-image-compression'

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    disabled?: boolean
    compressionOptions?: {
        maxSizeMB?: number
        maxWidthOrHeight?: number
        useWebWorker?: boolean
    }
}

export function ImageUpload({ value, onChange, disabled, compressionOptions }: ImageUploadProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const processFile = async (file: File) => {
        if (!file) return

        setIsLoading(true)
        setErrorMessage(null)
        try {
            const options = compressionOptions || {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true
            }

            let compressed: File
            try {
                compressed = await imageCompression(file, options)
            } catch (compressionError) {
                // Some browsers/devices fail with WebWorker compression; retry without worker.
                compressed = await imageCompression(file, { ...options, useWebWorker: false })
            }
            const formData = new FormData()
            formData.append('file', compressed)
            const { publicUrl } = await uploadImageAction(formData)
            onChange(publicUrl)
        } catch (error) {
            console.error('Upload failed:', error)
            const message = error instanceof Error ? error.message : 'Neznámá chyba'
            setErrorMessage(message)
        } finally {
            setIsLoading(false)
        }
    }

    const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0]
        e.currentTarget.value = ''
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
        <div className="w-full space-y-3">
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
            {errorMessage && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                    <p className="font-medium text-destructive">Nahrávání selhalo. Zkuste to prosím znovu.</p>
                    <details className="mt-2">
                        <summary className="cursor-pointer text-muted-foreground">Zobrazit detail chyby</summary>
                        <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-muted-foreground">{errorMessage}</pre>
                    </details>
                </div>
            )}
        </div>
    )
}
