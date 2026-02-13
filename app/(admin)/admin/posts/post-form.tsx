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
import { createPost, updatePost, Post } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { ArrowLeft, Globe, Settings, Megaphone, Calendar } from "lucide-react"
import { FormActions } from "@/components/admin/form-actions"
import { slugify } from "@/lib/utils"

const Tiptap = dynamic(() => import("@/components/tiptap"), { ssr: false })
import { ImageUpload } from "@/components/image-upload"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Název musí mít alespoň 2 znaky.",
  }),
  slug: z.string().min(2, {
     message: "Slug musí mít alespoň 2 znaky.",
  }).regex(/^[a-z0-9-]+$/, {
     message: "Slug může obsahovat pouze malá písmena, čísla a pomlčky.",
  }),
  excerpt: z.string().optional(),
  content: z.any().optional(), // jsonb from Tiptap
  published_at: z.string().optional(),
  image_url: z.string().optional().or(z.literal("")),
  is_hidden: z.boolean().default(false),
})

interface PostFormProps {
  initialData?: Post
}

export function PostForm({ initialData }: PostFormProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "", 
      published_at: initialData?.published_at ? new Date(initialData.published_at).toISOString().slice(0, 16) : "",
      image_url: initialData?.image_url || "",
      is_hidden: initialData?.is_hidden || false,
    },
  })

  // Auto-generate slug from title if empty
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const title = e.target.value;
      form.setValue("title", title);
      
      if (!initialData) { // Only auto-generate for new posts to avoid breaking links
          const slug = slugify(title);
          
          // Only set if slug hasn't been manually touched (this is hard to track with just RHQ, simplified logic: always set if creating)
          if (!form.getValues("slug") || form.getFieldState("slug").isDirty === false) {
             form.setValue("slug", slug);
          }
      }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    
    // Convert local datetime to ISO string for DB
    const isoDate = values.published_at ? new Date(values.published_at).toISOString() : null;

    const dataToSave = {
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt || null,
        content: values.content, 
        published_at: isoDate,
        image_url: values.image_url || null,
        is_hidden: values.is_hidden,
    }

    try {
        if (initialData) {
            await updatePost(initialData.id, dataToSave)
            toast.success("Aktualita byla upravena")
            form.reset(values) // Reset form state to clear dirty flag
            router.push("/admin/posts") // Redirect to overview
        } else {
            await createPost(dataToSave)
            toast.success("Aktualita byla vytvořena")
            form.reset(values) // Reset even on create to prevent warning during redirect
            router.push("/admin/posts")
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
                saveLabel={initialData ? "Uložit změny" : "Vytvořit aktualitu"}
            />

            {/* Single Column Layout */}
            <div className="space-y-6">
                
                {/* Check: Settings moved to top (Above Title) */}
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
                                    <FormLabel className="text-base font-semibold">Zveřejnit</FormLabel>
                                        <FormDescription>
                                        Viditelný pro veřejnost.
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
                        name="published_at"
                        render={({ field }) => (
                            <FormItem className="flex flex-col justify-center p-4 border rounded-lg bg-card shadow-sm">
                            <FormLabel className="font-semibold flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" /> Datum publikování
                            </FormLabel>
                                <div className="relative">
                                <FormControl>
                                <Input 
                                    type="datetime-local" 
                                    {...field} 
                                    className="w-full bg-background"
                                />
                                </FormControl>
                            </div>
                            <FormDescription className="mt-1">
                                Prázdné = Nezveřejněno
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
                        <FormLabel>Nadpis</FormLabel>
                        <FormControl>
                            <Input placeholder="Např. Novinky z hnutí" className="text-lg font-medium" {...field} onChange={handleTitleChange} />
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
                            <Input {...field} className="pl-16" />
                            <div className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">/blog/</div>
                            <Globe className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Perex (úvod)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Krátký úvod, který se zobrazí ve výpisu..." className="min-h-[100px]" {...field} />
                        </FormControl>
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
                
                {/* Content - Full Width */}
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Obsah</FormLabel>
                        <FormControl>
                            <div className="min-h-[300px] border rounded-md">
                                <Tiptap content={field.value || ""} onChange={field.onChange} />
                            </div>
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
