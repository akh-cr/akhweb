"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Tiptap from "@/components/tiptap"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/image-upload"

const formSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky."),
  slug: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  image_url: z.string().optional().or(z.literal("")),
})

interface CityFormProps {
  initialData?: z.infer<typeof formSchema> & { id: string }
}

export function CityForm({ initialData }: CityFormProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      image_url: initialData?.image_url || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createClient()
    
    // Auto-generate slug if empty
    let slug = values.slug
    if (!slug && values.name) {
        slug = values.name.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
    }

    const dataToSave = {
        name: values.name,
        slug: slug,
        description: values.description,
        content: values.content,
        image_url: values.image_url || null,
    }

    let error;
    if (initialData) {
        // Update
        const result = await supabase
            .from('cities')
            .update(dataToSave)
            .eq('id', initialData.id)
        error = result.error
    } else {
        // Create
        const { error: insertError } = await supabase
            .from('cities')
            .insert(dataToSave)
        error = insertError
    }

    if (error) {
        toast.error("Chyba při ukládání: " + error.message)
    } else {
        toast.success(initialData ? "Město bylo upraveno" : "Město bylo vytvořeno")
        router.push("/admin/cities")
        router.refresh()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Název města</FormLabel>
                        <FormControl>
                        <Input placeholder="Např. Brno" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                 <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Krátký popis</FormLabel>
                        <FormControl>
                            <Textarea 
                                placeholder="Stručný úvod do záhlaví stránky..." 
                                className="resize-none h-32" 
                                {...field} 
                                value={field.value || ''} 
                            />
                        </FormControl>
                        <FormDescription>Zobrazí se v hero sekci vedle/pod nadpisem.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>URL Slug (volitelné)</FormLabel>
                        <FormControl>
                        <Input placeholder="Automaticky dle názvu" {...field} />
                        </FormControl>
                        <FormDescription>Např. 'brno' pro /spolecenstvi/brno</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            {/* Right Column: Image */}
            <div className="space-y-6">
                 <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fotografie</FormLabel>
                        <FormControl>
                            <ImageUpload 
                                value={field.value || ""} 
                                onChange={field.onChange} 
                            />
                        </FormControl>
                        <FormDescription>Nahrajte reprezentativní foto.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
        </div>

        {/* Full Width: Content */}
        <div className="space-y-6">
            <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Obsah stránky</FormLabel>
                    <FormControl>
                        <Tiptap content={field.value || ""} onChange={field.onChange} />
                    </FormControl>
                     <FormDescription>Text, nadpisy a další informace.</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <Button type="submit" size="lg" className="w-full md:w-auto">
            {initialData ? "Uložit změny" : "Vytvořit město"}
        </Button>
      </form>
    </Form>
  )
}
