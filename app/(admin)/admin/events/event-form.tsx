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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Tiptap from "@/components/tiptap"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Název musí mít alespoň 2 znaky.",
  }),
  description: z.string().optional(),
  content: z.string().optional(),
  start_time: z.string(),
  city_id: z.string().optional(),
  location: z.string().optional(),
  image_url: z.string().url("Neplatná URL").optional().or(z.literal("")),
  registration_link: z.string().url("Neplatná URL").optional().or(z.literal("")),
})

interface EventFormProps {
  initialData?: z.infer<typeof formSchema> & { id: string }
}

export function EventForm({ initialData }: EventFormProps) {
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
      registration_link: initialData?.registration_link || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createClient()
    
    // Convert local datetime to ISO string for DB
    const isoDate = new Date(values.start_time).toISOString();

    const dataToSave = {
        title: values.title,
        description: values.description,
        content: values.content,
        start_time: isoDate,
        city_id: values.city_id || null, // Handle empty string as null
        location: values.location,
        image_url: values.image_url || null,
        registration_link: values.registration_link || null,
    }

    let error;
    if (initialData) {
         const result = await supabase
            .from('events')
            .update(dataToSave)
            .eq('id', initialData.id)
        error = result.error
    } else {
        const result = await supabase
            .from('events')
            .insert(dataToSave)
        error = result.error
    }

    if (error) {
        toast.error("Chyba při ukládání akce: " + error.message)
    } else {
        toast.success(initialData ? "Akce byla upravena" : "Akce byla úspěšně vytvořena")
        router.push("/admin/events")
        router.refresh()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                name="start_time"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Datum a čas začátku</FormLabel>
                    <FormControl>
                        <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Krátký popis (zobrazen v seznamu)</FormLabel>
                <FormControl>
                    <Input placeholder="Stručný popis..." {...field} />
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
                <FormLabel>Obsah akce (HTML/Rich Text)</FormLabel>
                <FormControl>
                     <Tiptap content={field.value || ""} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Místo konání</FormLabel>
                    <FormControl>
                        <Input placeholder="Např. Chata pod Sněžkou" {...field} />
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
                    <FormLabel>ID Města (volitelné)</FormLabel>
                    <FormControl>
                        <Input placeholder="např. brno (nechte prázdné pro celostátní)" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>URL Obrázku</FormLabel>
                    <FormControl>
                    <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="registration_link"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Odkaz na registraci</FormLabel>
                    <FormControl>
                    <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <Button type="submit">{initialData ? "Uložit změny" : "Vytvořit akci"}</Button>
      </form>
    </Form>
  )
}
