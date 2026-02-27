"use client"

import { slugify } from "@/lib/utils"

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
import { createEvent, updateEvent, Event } from "./actions"
import { createEventOrganizer, deleteEventOrganizer, updateAkhOrganizerColor, updateEventOrganizerColor } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"
import { MapPin, Megaphone, Globe, Plus, Trash2 } from "lucide-react"
import { FormActions } from "@/components/admin/form-actions"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DEFAULT_EXTERNAL_ORGANIZER_COLOR_HEX,
  getOrganizerTagPresentation,
  ORGANIZER_COLOR_OPTIONS,
  type OrganizerColorHex,
} from "@/lib/event-organizer-colors"

// Import Tiptap dynamically to avoid SSR issues
const Tiptap = dynamic(() => import("@/components/tiptap"), { ssr: false })
import { ImageUpload } from "@/components/image-upload"
import { GalleryUpload } from "@/components/gallery-upload"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Schema definition
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Název akce musí mít alespoň 2 znaky.",
  }),
  slug: z.string().min(2, {
    message: "Slug musí mít alespoň 2 znaky.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "Slug může obsahovat pouze malá písmena, čísla a pomlčky.",
  }),
  description: z.string().min(10, {
    message: "Popis musí mít alespoň 10 znaků.",
  }),
  content: z.string().optional(),
  start_time: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Platné datum a čas začátku jsou vyžadovány.",
  }),
  city_id: z.string().optional().nullable(),
  organizer_id: z.string().optional().nullable(),
  location: z.string().min(2, {
    message: "Místo konání musí mít alespoň 2 znaky.",
  }),
  image_url: z.string().optional().nullable(),
  gallery_images: z.array(z.string()).optional(),
  registration_link: z.string().url().optional().or(z.literal("")),
  facebook_event_link: z.string().url().optional().or(z.literal("")),
  news_publish_date: z.string().optional().nullable().or(z.literal("")), 
  is_hidden: z.boolean().default(false),
})

interface City {
  id: string
  name: string
}

interface Organizer {
  id: string
  name: string
  color_hex: string
}

interface EventFormProps {
  initialData?: Event
  cities: City[]
  organizers: Organizer[]
  akhOrganizerColor: OrganizerColorHex
}

export function EventForm({ initialData, cities, organizers, akhOrganizerColor }: EventFormProps) {
  const router = useRouter()
  const [organizerOptions, setOrganizerOptions] = useState<Organizer[]>(organizers)
  const [newOrganizerName, setNewOrganizerName] = useState("")
  const [newOrganizerColor, setNewOrganizerColor] = useState<OrganizerColorHex>(DEFAULT_EXTERNAL_ORGANIZER_COLOR_HEX)
  const [akhColor, setAkhColor] = useState<OrganizerColorHex>(akhOrganizerColor)
  const [isOrganizerSubmitting, setIsOrganizerSubmitting] = useState(false)
  const [showOrganizerManager, setShowOrganizerManager] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      // Convert ISO date to datetime-local format if initialData exists
      start_time: initialData?.start_time ? new Date(initialData.start_time).toISOString().slice(0, 16) : "",
      city_id: initialData?.city_id || "",
      organizer_id: initialData?.organizer_id || "null_option",
      location: initialData?.location || "",
      image_url: initialData?.image_url || "",
      gallery_images: initialData?.gallery_images || [],
      registration_link: initialData?.registration_link || "",
      facebook_event_link: initialData?.facebook_event_link || "",
      news_publish_date: initialData?.news_publish_date ? new Date(initialData.news_publish_date).toISOString().slice(0, 16) : "",
      is_hidden: initialData?.is_hidden || false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    
    // Convert local datetime to ISO string for DB
    const isoDate = new Date(values.start_time).toISOString();

    // Auto-generate slug (mock logic here as Event schema doesn't seem to have slug field yet? Wait, let me check the schema/types)
    // Looking at the file, the formSchema DOES NOT HAVE SLUG. 
    // I need to ADD slug to formSchema first!

    // Auto-generate slug if empty
    let slug = values.slug
    if (!slug && values.title) {
        slug = slugify(values.title)
        toast.info(`Slug byl automaticky vygenerován: ${slug}`)
    }

    const dataToSave = {
        title: values.title,
        slug: slug,
        description: values.description,
        content: values.content || null,
        start_time: isoDate,
        city_id: values.city_id === "null_option" ? null : (values.city_id || null),
        organizer_id: values.organizer_id === "null_option" ? null : (values.organizer_id || null),
        location: values.location,
        image_url: values.image_url || null,
        gallery_images: values.gallery_images || [],
        registration_link: values.registration_link || null,
        facebook_event_link: values.facebook_event_link || null,
        news_publish_date: values.news_publish_date ? new Date(values.news_publish_date).toISOString() : null,
        is_hidden: values.is_hidden,
    }

    try {
        if (initialData) {
            await updateEvent(initialData.id, dataToSave)
            toast.success("Akce byla upravena")
            form.reset(values)
            router.push("/admin/events") // Redirect to overview
        } else {
            await createEvent(dataToSave)
            toast.success("Akce byla úspěšně vytvořena")
            form.reset(values)
            router.push("/admin/events")
        }
        router.refresh()
    } catch (error) {
        toast.error("Chyba: " + (error as Error).message)
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
                saveLabel={initialData ? "Uložit změny" : "Vytvořit akci"}
            />
            
            {/* Main Single Column Layout */}
            <div className="space-y-6">
                
                {/* Settings (Visibility & News) - Moved to top (Above Title) */}
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
                    <CardContent className="px-0 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="is_hidden"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base font-semibold">Zveřejnit akci</FormLabel>
                                        <FormDescription>
                                            Viditelná pro všechny.
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
                                    <Megaphone className="h-4 w-4 text-muted-foreground" /> Vyzdvihnout v aktualitách
                                </FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input 
                                            type="datetime-local" 
                                            {...field} 
                                            value={field.value || ""} 
                                            className="w-full bg-background"    
                                        />
                                    </FormControl>
                                </div>
                                    <FormDescription className="mt-1">
                                    Volitelné. Zobrazí se na hlavní stránce.
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="organizer_id"
                            render={({ field }) => (
                                (() => {
                                    const isAkhSelected = !field.value || field.value === "null_option"
                                    const selectedOrganizer = organizerOptions.find((organizer) => organizer.id === field.value)
                                    const selectedLabel = selectedOrganizer?.name || "AKH"
                                    const selectedTag = getOrganizerTagPresentation(
                                        selectedOrganizer?.color_hex || null,
                                        isAkhSelected,
                                        akhColor,
                                    )

                                    return (
                                <FormItem className="flex flex-col justify-center p-4 border rounded-lg bg-card shadow-sm">
                                    <FormLabel className="font-semibold mb-2">Pořadatel</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value || "null_option"}>
                                            <SelectTrigger className="bg-background">
                                                <SelectValue placeholder="Vyberte pořadatele" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="null_option">AKH (výchozí)</SelectItem>
                                                {organizerOptions.map((organizer) => (
                                                    <SelectItem key={organizer.id} value={organizer.id}>
                                                        {organizer.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription className="mt-1">
                                        Pokud nevyberete pořadatele, použije se automaticky AKH.
                                    </FormDescription>
                                    <div className="mt-2">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${selectedTag.className}`}
                                            style={selectedTag.style}
                                        >
                                            {selectedLabel}
                                        </span>
                                    </div>
                                    <div className="mt-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="px-0 w-full justify-start text-left whitespace-normal h-auto"
                                            onClick={() => setShowOrganizerManager(true)}
                                        >
                                            Správa pořadatelů
                                        </Button>
                                    </div>
                                    <Dialog open={showOrganizerManager} onOpenChange={setShowOrganizerManager}>
                                        <DialogContent className="sm:max-w-[560px]">
                                            <DialogHeader>
                                                <DialogTitle>Správa pořadatelů</DialogTitle>
                                                <DialogDescription>
                                                    Přidávejte nebo mažte pořadatele. Smazat lze jen pořadatele bez přiřazených akcí.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="Nový pořadatel"
                                                        value={newOrganizerName}
                                                        onChange={(e) => setNewOrganizerName(e.target.value)}
                                                        className="bg-background"
                                                    />
                                                    <Select
                                                        value={newOrganizerColor}
                                                        onValueChange={(value) => setNewOrganizerColor(value as OrganizerColorHex)}
                                                    >
                                                        <SelectTrigger className="w-[170px] bg-background">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ORGANIZER_COLOR_OPTIONS.map((option) => (
                                                                <SelectItem key={option.hex} value={option.hex}>
                                                                    <span className="inline-flex items-center gap-2">
                                                                        <span className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: option.hex, borderColor: option.hex }} />
                                                                        {option.label}
                                                                    </span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isOrganizerSubmitting || !newOrganizerName.trim()}
                                                        onClick={async () => {
                                                            try {
                                                                setIsOrganizerSubmitting(true)
                                                                const result = await createEventOrganizer(newOrganizerName, newOrganizerColor)
                                                                if (!result.success) {
                                                                    throw new Error(result.error)
                                                                }
                                                                const created = result.organizer
                                                                setOrganizerOptions((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, 'cs')))
                                                                setNewOrganizerName("")
                                                                setNewOrganizerColor(DEFAULT_EXTERNAL_ORGANIZER_COLOR_HEX)
                                                                form.setValue("organizer_id", created.id)
                                                                toast.success("Pořadatel vytvořen")
                                                            } catch (error) {
                                                                toast.error((error as Error).message)
                                                            } finally {
                                                                setIsOrganizerSubmitting(false)
                                                            }
                                                        }}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Přidat
                                                    </Button>
                                                </div>
                                                {organizerOptions.length > 0 ? (
                                                    <div className="space-y-1 max-h-64 overflow-auto border rounded-md p-2 bg-background">
                                                        {organizerOptions.map((organizer) => (
                                                            <div key={organizer.id} className="flex items-center justify-between gap-2 text-sm">
                                                                <span
                                                                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${getOrganizerTagPresentation(organizer.color_hex, false).className}`}
                                                                    style={getOrganizerTagPresentation(organizer.color_hex, false).style}
                                                                >
                                                                    {organizer.name}
                                                                </span>
                                                                <div className="ml-auto flex items-center gap-2">
                                                                    <Select
                                                                        value={organizer.color_hex || ORGANIZER_COLOR_OPTIONS[0].hex}
                                                                        onValueChange={async (value) => {
                                                                            const nextColor = value as OrganizerColorHex
                                                                            try {
                                                                                setIsOrganizerSubmitting(true)
                                                                                await updateEventOrganizerColor(organizer.id, nextColor)
                                                                                setOrganizerOptions((prev) =>
                                                                                    prev.map((o) => (o.id === organizer.id ? { ...o, color_hex: nextColor } : o)),
                                                                                )
                                                                            } catch (error) {
                                                                                toast.error((error as Error).message)
                                                                            } finally {
                                                                                setIsOrganizerSubmitting(false)
                                                                            }
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="h-8 w-[150px] bg-background">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {ORGANIZER_COLOR_OPTIONS.map((option) => (
                                                                                <SelectItem key={option.hex} value={option.hex}>
                                                                                    <span className="inline-flex items-center gap-2">
                                                                                        <span className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: option.hex, borderColor: option.hex }} />
                                                                                        {option.label}
                                                                                    </span>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <Button
                                                                        type="button"
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 text-destructive"
                                                                        disabled={isOrganizerSubmitting}
                                                                        onClick={async () => {
                                                                            try {
                                                                                setIsOrganizerSubmitting(true)
                                                                                await deleteEventOrganizer(organizer.id)
                                                                                setOrganizerOptions((prev) => prev.filter((o) => o.id !== organizer.id))
                                                                                if (form.getValues("organizer_id") === organizer.id) {
                                                                                    form.setValue("organizer_id", "null_option")
                                                                                }
                                                                                toast.success("Pořadatel smazán")
                                                                            } catch (error) {
                                                                                toast.error((error as Error).message)
                                                                            } finally {
                                                                                setIsOrganizerSubmitting(false)
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground px-1">Žádní další pořadatelé nejsou vytvořeni.</p>
                                                )}
                                                <div className="border rounded-md p-3 bg-background space-y-2">
                                                    <div className="text-sm font-medium">AKH (výchozí pořadatel)</div>
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${getOrganizerTagPresentation(null, true, akhColor).className}`}
                                                        style={getOrganizerTagPresentation(null, true, akhColor).style}
                                                    >
                                                        AKH
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <Select
                                                            value={akhColor}
                                                            onValueChange={(value) => setAkhColor(value as OrganizerColorHex)}
                                                        >
                                                            <SelectTrigger className="h-8 w-[170px] bg-background">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {ORGANIZER_COLOR_OPTIONS.map((option) => (
                                                                    <SelectItem key={option.hex} value={option.hex}>
                                                                        <span className="inline-flex items-center gap-2">
                                                                            <span className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: option.hex, borderColor: option.hex }} />
                                                                            {option.label}
                                                                        </span>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={isOrganizerSubmitting}
                                                            onClick={async () => {
                                                                try {
                                                                    setIsOrganizerSubmitting(true)
                                                                    await updateAkhOrganizerColor(akhColor)
                                                                    toast.success("Barva AKH uložena")
                                                                    router.refresh()
                                                                } catch (error) {
                                                                    toast.error((error as Error).message)
                                                                } finally {
                                                                    setIsOrganizerSubmitting(false)
                                                                }
                                                            }}
                                                        >
                                                            Uložit AKH
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </FormItem>
                                    )
                                })()
                            )}
                        />
                    </CardContent>
                </Card>

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Název akce</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="Např. Silvestr na horách" 
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

                <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>URL adresa (slug)</FormLabel>
                        <div className="relative">
                            <Input {...field} className="pl-16" placeholder="Automaticky dle názvu" />
                            <div className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">/akce/</div>
                            <Globe className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Krátký popis (perex)</FormLabel>
                        <FormControl>
                            <Textarea 
                                placeholder="Stručný popis zobrazený v seznamu..." 
                                className="resize-y" 
                                {...field} 
                            />
                        </FormControl>
                        <FormDescription>Zobrazí se v náhledu akce.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Exception: Row for Time and City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="start_time"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Začátek akce</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="city_id"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Město</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "null_option"}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Vyberte město" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="null_option">Celostátní / Online</SelectItem>
                                    {cities.map((city) => (
                                        <SelectItem key={city.id} value={city.id}>
                                            {city.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Konkrétní místo</FormLabel>
                        <div className="relative">
                            <Input placeholder="Např. Klubovna, 2. patro" {...field} />
                            <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Úvodní obrázek</FormLabel>
                        <FormControl>
                        <ImageUpload 
                            value={field.value || ""} 
                            onChange={field.onChange} 
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Detailní obsah</FormLabel>
                        <FormControl>
                            <div className="min-h-[300px] border rounded-md overflow-hidden max-w-full">
                                <Tiptap content={field.value || ""} onChange={field.onChange} />
                            </div>
                        </FormControl>
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

                {/* Links Section - Settings moved up */}
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-medium">Odkazy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="registration_link"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Registrace (URL)</FormLabel>
                                <FormControl>
                                <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="facebook_event_link"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Facebook (URL)</FormLabel>
                                <FormControl>
                                <Input placeholder="https://facebook.com/..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </div>

            </div>

        </form>
        </Form>
    </div>
  )
}
