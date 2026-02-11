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
import { createEvent, updateEvent, Event } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"
import { MapPin, Calendar as CalendarIcon, Settings, Megaphone } from "lucide-react"
import { FormActions } from "@/components/admin/form-actions"

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
  description: z.string().min(10, {
    message: "Popis musí mít alespoň 10 znaků.",
  }),
  content: z.string().optional(),
  start_time: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Platné datum a čas začátku jsou vyžadovány.",
  }),
  city_id: z.string().optional().nullable(),
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

interface EventFormProps {
  initialData?: Event
  cities: City[]
}

export function EventForm({ initialData, cities }: EventFormProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      // Convert ISO date to datetime-local format if initialData exists
      start_time: initialData?.start_time ? new Date(initialData.start_time).toISOString().slice(0, 16) : "",
      city_id: initialData?.city_id || "",
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

    const dataToSave = {
        title: values.title,
        description: values.description,
        content: values.content || null,
        start_time: isoDate,
        city_id: values.city_id === "null_option" ? null : (values.city_id || null),
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
        } else {
            await createEvent(dataToSave)
            toast.success("Akce byla úspěšně vytvořena")
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
                    <CardContent className="px-0 grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    </CardContent>
                </Card>

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Název akce</FormLabel>
                        <FormControl>
                            <Input placeholder="Např. Silvestr na horách" {...field} />
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
