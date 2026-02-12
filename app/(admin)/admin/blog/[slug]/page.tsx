"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Tiptap from "@/components/tiptap"
import { ArrowLeft, ExternalLink, Megaphone } from "lucide-react"
import Link from "next/link"
import { FormActions } from "@/components/admin/form-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form State
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isNew, setIsNew] = useState(false)

  // Initial Data for Dirty Check
  const [initialData, setInitialData] = useState({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      imageUrl: ""
  })
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    params.then((p) => {
        if (p.slug === 'create') {
            setIsNew(true)
            setLoading(false)
        } else {
            fetchPost(p.slug)
        }
    })
  }, [params])

  // Check for dirty state
  useEffect(() => {
      if (loading) return
      
      const isModified = 
          title !== initialData.title ||
          slug !== initialData.slug ||
          excerpt !== initialData.excerpt ||
          content !== initialData.content ||
          imageUrl !== initialData.imageUrl
      
      setIsDirty(isModified)
  }, [title, slug, excerpt, content, imageUrl, initialData, loading])


  async function fetchPost(slug:string) {
    const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).single()
    if (error) {
        toast.error("Chyba při načítání článku")
        router.push("/admin/blog")
    } else {
        const loadedData = {
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || "",
            content: data.content || "",
            imageUrl: data.image_url || ""
        }
        
        setTitle(loadedData.title)
        setSlug(loadedData.slug)
        setExcerpt(loadedData.excerpt)
        setContent(loadedData.content)
        setImageUrl(loadedData.imageUrl)
        
        setInitialData(loadedData)
    }
    setLoading(false)
  }

  function generateSlug(text: string) {
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
  }

  async function handleSave() {
    setSaving(true)
    
    if (!title || !slug) {
        toast.error("Vyplňte titulek a slug")
        setSaving(false)
        return
    }

    const postData = {
        title,
        slug,
        excerpt,
        content,
        image_url: imageUrl,
        updated_at: new Date()
    }

    let error;

    if (isNew) {
        const { error: insertError } = await supabase.from('posts').insert([postData])
        error = insertError
    } else {
        const { error: updateError } = await supabase.from('posts').update(postData).eq('slug', initialData.slug) // Use initialData.slug to find the record even if slug changed
        error = updateError
    }

    if (error) {
        toast.error("Chyba při ukládání: " + error.message)
    } else {
        toast.success("Článek uložen")
        
        // Update initial data to current
        setInitialData({
            title,
            slug,
            excerpt,
            content,
            imageUrl
        })
        
        if (isNew) {
             // If new, redirect to edit page of created post so we don't create duplicate on next save
             router.replace(`/admin/blog/${slug}`)
             setIsNew(false)
        } else {
            if (slug !== initialData.slug) {
                 router.replace(`/admin/blog/${slug}`)
            }
            router.refresh()
        }
    }
    setSaving(false)
  }

  if (loading) return <p className="p-10">Načítání...</p>

    return (
    <div className="pb-12 max-w-3xl mx-auto w-full">
         <FormActions 
            isDirty={isDirty}
            onCancel={() => router.back()}
            onSave={handleSave}
            isSubmitting={saving}
            saveLabel={isNew ? "Vytvořit článek" : "Uložit změny"}
        />

       <div className="flex items-center justify-between py-6 px-4">
          <div className="flex items-center gap-4">
             <Link href="/admin/blog">
                 <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
             </Link>
             <h1 className="text-3xl font-bold">{isNew ? "Nový článek" : "Upravit článek"}</h1>
             {!isNew && slug && (
                 <Link href={`/blog/${slug}`} target="_blank">
                     <Button variant="ghost" size="icon" title="Zobrazit na webu">
                         <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                     </Button>
                 </Link>
             )}
          </div>
       </div>

       <div className="space-y-6 px-4 pb-20">
            {/* Settings Card */}
            <Card className="shadow-none border-b rounded-none border-x-0 border-t-0 p-0 mb-6 bg-transparent">
                <CardHeader className="px-0 pt-0 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Nastavení článku
                    </CardTitle>
                    <CardDescription>
                        Metadata a URL nastavení.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="grid gap-2">
                        <Label htmlFor="slug">URL Slug</Label>
                        <Input 
                            id="slug" 
                            value={slug} 
                            onChange={(e) => setSlug(e.target.value)} 
                            disabled={!isNew} 
                            placeholder="url-clanku"
                        />
                        <p className="text-xs text-muted-foreground">Unikátní identifikátor v adrese.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="image">URL Obrázku</Label>
                        <Input 
                            id="image" 
                            value={imageUrl} 
                            onChange={(e) => setImageUrl(e.target.value)} 
                            placeholder="https://..." 
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-2">
                <Label htmlFor="title" className="text-lg">Titulek</Label>
                <Input 
                    id="title" 
                    value={title} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setTitle(e.target.value)
                        if (isNew) setSlug(generateSlug(e.target.value))
                    }} 
                    className="text-lg py-6"
                    placeholder="Witty titulek..."
                />
            </div>
            
            <div className="grid gap-2">
                <Label htmlFor="excerpt">Perex (krátký úvod)</Label>
                <Textarea 
                    id="excerpt" 
                    value={excerpt} 
                    onChange={(e) => setExcerpt(e.target.value)} 
                    rows={3} 
                    className="resize-y"
                    placeholder="Krátké shrnutí obsahu..."
                />
            </div>

            <div className="grid gap-2">
                <Label>Obsah</Label>
                <div className="min-h-[400px] border rounded-md overflow-hidden max-w-full bg-background">
                    <Tiptap content={content} onChange={setContent} />
                </div>
            </div>
       </div>
    </div>
  )
}
