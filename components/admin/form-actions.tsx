"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface FormActionsProps {
  isDirty: boolean
  isSubmitting?: boolean
  onCancel: () => void
  onSave: () => void
  saveLabel?: string
  cancelLabel?: string
}

export function FormActions({ 
    isDirty, 
    isSubmitting, 
    onCancel, 
    onSave, 
    saveLabel = "Uložit",
    cancelLabel = "Zrušit"
}: FormActionsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto w-full px-4">
        <div className="flex flex-col w-full sm:w-auto order-2 sm:order-1">
            <div className={cn("transition-opacity duration-300", isDirty ? "opacity-100" : "opacity-0")}>
                <span className="font-semibold text-amber-600 dark:text-amber-500 block text-center sm:text-left text-sm sm:text-base">
                    ⚠ <span className="inline sm:hidden">Neuložené změny</span><span className="hidden sm:inline">Máte neuložené změny</span>
                </span>
            </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
           <Button 
                variant="ghost" 
                type="button"
                onClick={onCancel} 
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
            >
                {cancelLabel}
            </Button>
           <Button 
                type="button" 
                onClick={onSave} 
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
            >
                {isSubmitting ? "Ukládám..." : saveLabel}
           </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
