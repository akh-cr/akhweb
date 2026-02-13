"use client"

import { cn, slugify } from "@/lib/utils"

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
import { Search, Settings, Megaphone, Calendar } from "lucide-react"
import { searchCityCoordinates } from "./actions"
import { FormActions } from "@/components/admin/form-actions"

import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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
  is_hidden: z.boolean().default(false),
  contact_name: z.string().optional(),
  contact_email: z.string().email("Neplatný email").optional().or(z.literal("")),
  news_publish_date: z.string().optional().nullable(),
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
      is_hidden: initialData?.is_hidden || false,
      contact_name: initialData?.contact_name || "",
      contact_email: initialData?.contact_email || "",
      news_publish_date: initialData?.news_publish_date ? new Date(initialData.news_publish_date).toISOString().slice(0, 16) : "",
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
        slug = slugify(values.name)
        toast.info(`Slug byl automaticky vygenerován: ${slug}`)
    }

    const dataToSave = {
        name: values.name,
        slug: slug,
        region: values.region,
        description: values.description,
        content: values.content,
        image_url: values.image_url || null,
        gallery_images: values.gallery_images || [],
        is_hidden: values.is_hidden,
        contact_name: values.contact_name,
        contact_email: values.contact_email,
        news_publish_date: values.news_publish_date ? new Date(values.news_publish_date).toISOString() : null,
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
        form.reset(values)
        router.push("/admin/cities")
        router.refresh()
    }
  }

  return (
    <div className="pb-12">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
            <FormActions 
                isDirty={form.formState.isDirty}
                onCancel={() => router.back()}
                onSave={form.handleSubmit(onSubmit)}
                isSubmitting={form.formState.isSubmitting}
                saveLabel={initialData ? "Uložit změny" : "Vytvořit město"}
            />
            
            {/* Single Column Layout */}
            <div className="space-y-6">
                
                {/* Settings moved to Top (Above Name) */}
                {/* Settings Card */}
                <Card className="shadow-none border-b rounded-none border-x-0 border-t-0 p-0 mb-6 bg-transparent">
                    <CardHeader className="px-0 pt-0 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                             Nastavení zobrazení
                        </CardTitle>
                        <CardDescription>
                            Ovládání viditelnosti a propagace obsahu.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="is_hidden"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card">
                                <div className="space-y-0.5">
                                <FormLabel className="text-base font-semibold">Zveřejnit společenství</FormLabel>
                                <FormDescription>
                                    Viditelné na veřejném webu.
                                </FormDescription>
                                </div>
                                <FormControl>
                                <Switch
                                    checked={!field.value}
                                    onCheckedChange={(val) => field.onChange(!val)}
                                />
                                </FormControl>
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="news_publish_date"
                            render={({ field }) => (
                            <FormItem className="flex flex-col justify-center p-4 border rounded-lg bg-card shadow-sm">
                                <FormLabel className="font-semibold flex items-center gap-2 mb-2">
                                   <Megaphone className="h-4 w-4 text-muted-foreground" /> Publikovat v aktualitách
                                </FormLabel>
                                <div className="relative">
                                    <FormControl>
                                    <Input 
                                        type="datetime-local" 
                                        {...field} 
                                        value={field.value || ''}
                                        className="w-full bg-background"
                                    />
                                    </FormControl>
                                </div>
                                <FormDescription className="mt-1">
                                    Vyplněním data se položka zobrazí v sekci Aktuality.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Contact Information Card */}
                <Card className="shadow-none border-b rounded-none border-x-0 border-t-0 p-0 mb-6 bg-transparent">
                    <CardHeader className="px-0 pt-0 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                             Kontaktní údaje
                        </CardTitle>
                        <CardDescription>
                            Informace o vedení nebo kontaktní osobě pro dané společenství.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="contact_name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kontaktní osoba (Vedoucí)</FormLabel>
                                <FormControl>
                                <Input placeholder="Např. Jan Novák" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Jméno vedoucího nebo název kolektivního vedení.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contact_email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kontaktní email</FormLabel>
                                <FormControl>
                                <Input type="email" placeholder="email@example.com" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Email pro zájemce o společenství.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Název města</FormLabel>
                        <FormControl>
                        <Input 
                            placeholder="Např. Brno" 
                            {...field} 
                            onChange={(e) => {
                                field.onChange(e)
                                if (!initialData) {
                                    const value = e.target.value
                                    const slug = slugify(value)
                                    // Only update if slug is empty or hasn't been manually edited
                                    const currentSlug = form.getValues("slug")
                                    const slugState = form.getFieldState("slug")
                                    if (!currentSlug || !slugState.isDirty) {
                                        form.setValue("slug", slug)
                                    }
                                }
                            }}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                {/* ... existing fields ... */}
                
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
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                        <Input placeholder="Automaticky dle názvu" {...field} />
                        </FormControl>
                        <FormDescription>Např. 'brno' pro /spolecenstvi/brno</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                {/* Coordinates Section */}
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
                
                {/* Content - Full Width */}
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Obsah stránky</FormLabel>
                        <FormControl>
                            <div className="min-h-[300px] border rounded-md overflow-hidden max-w-full">
                                <Tiptap content={field.value || ""} onChange={field.onChange} />
                            </div>
                        </FormControl>
                        <FormDescription>Text, nadpisy a další informace.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                 <FormField
                    control={form.control}
                    name="gallery_images"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Galerie</FormLabel>
                        <FormControl>
                        <GalleryUpload 
                            value={field.value || []} 
                            onChange={field.onChange} 
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

            </div>
            
        </form>
        </Form>
    </div>
  )
}
