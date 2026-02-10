"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
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
import { GalleryUpload } from "@/components/gallery-upload"
import { Search } from "lucide-react"
import { searchCityCoordinates } from "./actions"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Název musí mít alespoň 2 znaky.",
  }),
  slug: z.string().min(2, {
    message: "Slug musí mít alespoň 2 znaky.",
  }).optional().or(z.literal("")),
  region: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  image_url: z.string().refine((val) => {
      if (val === "") return true;
      if (val.startsWith("/")) return true; // Allow relative URLs
      if (val.startsWith("blob:")) return true; // Explicitly allow blobs
      try {
          new URL(val);
          return true;
      } catch {
          return false;
      }
  }, { message: "Neplatná URL" }).optional().or(z.literal("")),
  gallery_images: z.array(z.string()).optional(),
  latitude: z.any().optional(),
  longitude: z.any().optional(),
})

interface CityFormProps {
  initialData?: z.infer<typeof formSchema> & { id: string; metadata?: any }
}

interface SearchResult {
    lat: string;
    lon: string;
    display_name: string;
}

export function CityForm({ initialData }: CityFormProps) {
  const router = useRouter()
  const [showManualCoordinates, setShowManualCoordinates] = useState(!!initialData?.metadata?.map?.lat || !!initialData?.latitude)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      region: initialData?.region || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      image_url: initialData?.image_url || "",
      gallery_images: initialData?.gallery_images || [],
      latitude: initialData?.latitude ?? initialData?.metadata?.map?.lat,
      longitude: initialData?.longitude ?? initialData?.metadata?.map?.lon,
    },
  })

  async function handleSearch() {
    const name = form.getValues('name')
    if (!name) {
        toast.error("Vyplňte prosím název města")
        return
    }

    setIsLoading(true)
    setSearchResults([])
    try {
        const data = await searchCityCoordinates(name)

        if (data && data.length > 0) {
            setSearchResults(data)
            toast.success(`Nalezeno ${data.length} výsledků`)
        } else {
            toast.error("Město nebylo nalezeno")
        }
    } catch (error) {
        toast.error("Chyba při vyhledávání")
    } finally {
        setIsLoading(false)
    }
  }

  function selectCity(city: SearchResult) {
      form.setValue('latitude', parseFloat(city.lat))
      form.setValue('longitude', parseFloat(city.lon))
      setShowManualCoordinates(true)
      setSearchResults([])
      toast.success(`Vybráno: ${city.display_name}`)
  }


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
        region: values.region,
        description: values.description,
        content: values.content,
        image_url: values.image_url || null,
        gallery_images: values.gallery_images || [],
        metadata: {
            ...initialData?.metadata,
            map: {
                lat: values.latitude ? parseFloat(values.latitude.toString()) : undefined,
                lon: values.longitude ? parseFloat(values.longitude.toString()) : undefined
            }
        }
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
        const result = await supabase
            .from('cities')
            .insert({
                ...dataToSave,
                id: crypto.randomUUID(),
            })
        error = result.error
    }

    if (error) {
        toast.error("Chyba při ukládání města: " + error.message)
    } else {
        toast.success(initialData ? "Město bylo upraveno" : "Město bylo úspěšně vytvořeno")
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

                <div className="pt-4 border-t space-y-4">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Souřadnice (Mapování)</h3>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="w-full"
                            >
                                <Search className="mr-2 h-4 w-4" />
                                {isLoading ? "Vyhledávám..." : "Vyhledat souřadnice dle názvu"}
                            </Button>
                        </div>
                        <FormDescription>
                            Při úspěšném vyhledání vyberte správné město ze seznamu.
                        </FormDescription>

                        {searchResults.length > 0 && (
                            <div className="border rounded-md p-2 space-y-1 max-h-60 overflow-y-auto">
                                {searchResults.map((result, index) => (
                                    <Button
                                        key={index}
                                        type="button"
                                        variant="ghost"
                                        className="w-full justify-start h-auto py-2 px-3 text-left font-normal"
                                        onClick={() => selectCity(result)}
                                    >
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-medium text-sm">{result.display_name}</span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    {!showManualCoordinates ? (
                        <Button
                            type="button"
                            variant="link"
                            className="px-0 h-auto text-muted-foreground hover:text-foreground"
                            onClick={() => setShowManualCoordinates(true)}
                        >
                            Zadat souřadnice ručně
                        </Button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                            <FormField
                                control={form.control}
                                name="latitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zeměpisná šířka</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="any" placeholder="49.xxx" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="longitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zeměpisná délka</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="any" placeholder="16.xxx" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>
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
