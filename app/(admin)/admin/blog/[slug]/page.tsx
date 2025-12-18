"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Tiptap from "@/components/tiptap"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  
  const [isNew, setIsNew] = useState(false)

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

  async function fetchPost(slug:string) {
    const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).single()
    if (error) {
        toast.error("Chyba při načítání článku")
        router.push("/admin/blog")
    } else {
        setTitle(data.title)
        setSlug(data.slug)
        setExcerpt(data.excerpt || "")
        setContent(data.content || "")
        setImageUrl(data.image_url || "")
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
        const { error: updateError } = await supabase.from('posts').update(postData).eq('slug', slug)
        error = updateError
    }

    if (error) {
        toast.error("Chyba při ukládání: " + error.message)
    } else {
        toast.success("Článek uložen")
        router.push("/admin/blog")
        router.refresh()
    }
    setSaving(false)
  }

  if (loading) return <p className="p-10">Načítání...</p>

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Link href="/admin/blog">
                <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <h1 className="text-3xl font-bold">{isNew ? "Nový článek" : "Upravit článek"}</h1>
         </div>
         <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Ukládání..." : "Uložit změny"}
         </Button>
       </div>

       <div className="grid gap-6 p-6 border rounded-lg bg-card">
            <div className="grid gap-2">
                <Label htmlFor="title">Titulek</Label>
                <Input 
                    id="title" 
                    value={title} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setTitle(e.target.value)
                        if (isNew) setSlug(generateSlug(e.target.value))
                    }} 
                />
            </div>
            
            <div className="grid gap-2">
                <Label htmlFor="slug">URL Slug (unikátní identifikátor)</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={!isNew} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="image">URL Obrázku (volitelné)</Label>
                <Input id="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="excerpt">Perex (krátký úvod)</Label>
                <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
            </div>

             <div className="grid gap-2">
                <Label>Obsah</Label>
                <Tiptap content={content} onChange={setContent} />
            </div>
       </div>
    </div>
  )
}
