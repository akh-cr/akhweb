"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import { Button } from './ui/button'
import { 
    Bold, Italic, List, ListOrdered, Quote, Undo, Redo, 
    Image as ImageIcon, Link as LinkIcon, Youtube as YoutubeIcon, 
    Code, Type, BoxSelect, MoreHorizontal, Loader2
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Textarea } from './ui/textarea'
import { Toggle } from './ui/toggle'
import { Separator } from './ui/separator'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import imageCompression from 'browser-image-compression'
import { toast } from "sonner"

export default function Tiptap({ content, onChange }: { content: string, onChange: (html: string) => void }) {
  const [isSourceMode, setIsSourceMode] = useState(false)
  const [sourceCode, setSourceCode] = useState(content)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const editor = useEditor({
    extensions: [
        StarterKit,
        Image.configure({
            HTMLAttributes: {
                class: 'rounded-lg border shadow-sm max-w-full h-auto my-4',
            },
        }),
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: 'text-primary underline underline-offset-4',
            },
        }),
        Youtube.configure({
            controls: false,
            HTMLAttributes: {
                class: 'rounded-lg overflow-hidden border shadow-sm my-4 w-full aspect-video',
            },
        }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      setSourceCode(editor.getHTML())
    },
    editorProps: {
        attributes: {
            class: "min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none dark:prose-invert"
        }
    }
  })

  // Sync source code changes back to editor when switching modes
  useEffect(() => {
    if (!isSourceMode && editor) {
        editor.commands.setContent(sourceCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSourceMode, editor])


  if (!editor) {
    return null
  }

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
        // Compress
        const options = {
            maxSizeMB: 1, 
            maxWidthOrHeight: 1920,
            useWebWorker: true
        }
        const compressedFile = await imageCompression(file, options)

        // Upload
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `uploads/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, compressedFile)

        if (uploadError) {
            console.error("Supabase storage error:", uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath)

        editor.chain().focus().setImage({ src: publicUrl }).run()
        toast.success("Obrázek byl vložen")

    } catch (error) {
        console.error('Upload failed:', error)
        toast.error('Nahrávání obrázku selhalo')
    } finally {
        setIsUploading(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }
  }

  const addYoutube = () => {
    const url = window.prompt('URL YouTube videa')
    if (url) {
      editor.commands.setYoutubeVideo({ src: url })
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL odkazu', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const insertCustomButton = () => {
    const text = window.prompt('Text tlačítka', 'Klikni zde')
    const url = window.prompt('URL tlačítka', '/')
    
    if (text && url) {
        editor.chain().focus().insertContent(`<a href="${url}" target="_blank" class="button">${text}</a>`).run()
    }
  }

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSourceCode(e.target.value)
      onChange(e.target.value)
  }

  return (
    <div className="flex flex-col border rounded-md overflow-hidden bg-background">
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png, image/jpeg, image/jpg, image/webp" 
            onChange={handleImageUpload} 
        />
        
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-muted/40 border-b flex-wrap">
            <Toggle pressed={!isSourceMode} onPressedChange={() => setIsSourceMode(false)} aria-label="Visual Editor" size="sm">
                <Type className="h-4 w-4 mr-2" /> Vizuální
            </Toggle>
            <Toggle pressed={isSourceMode} onPressedChange={() => setIsSourceMode(true)} aria-label="Source Code" size="sm">
                <Code className="h-4 w-4 mr-2" /> HTML Zdroj
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-2" />

            {!isSourceMode && (
                <>
                    <Button variant={editor.isActive('bold') ? "secondary" : "ghost"} size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8">
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant={editor.isActive('italic') ? "secondary" : "ghost"} size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8">
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant={editor.isActive('link') ? "secondary" : "ghost"} size="icon" onClick={setLink} className="h-8 w-8">
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    
                    <Separator orientation="vertical" className="h-6 mx-2" />

                    <Button variant={editor.isActive('heading', { level: 2 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-8 px-2 font-bold">
                        H2
                    </Button>
                     <Button variant={editor.isActive('heading', { level: 3 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="h-8 px-2 font-bold">
                        H3
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="sm" className="h-8 gap-2" disabled={isUploading}>
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                Vložit
                             </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={triggerImageUpload}>
                                <ImageIcon className="h-4 w-4 mr-2" /> Obrázek
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={addYoutube}>
                                <YoutubeIcon className="h-4 w-4 mr-2" /> Video
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={insertCustomButton}>
                                <BoxSelect className="h-4 w-4 mr-2" /> Tlačítko
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBulletList().run()}>
                                <List className="h-4 w-4 mr-2" /> Seznam
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                                <ListOrdered className="h-4 w-4 mr-2" /> Číslovaný seznam
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                                <Quote className="h-4 w-4 mr-2" /> Citace
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                     <div className="ml-auto flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-8 w-8">
                            <Undo className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-8 w-8">
                            <Redo className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            )}
        </div>

        {/* Content */}
        {isSourceMode ? (
            <Textarea 
                value={sourceCode} 
                onChange={handleSourceChange} 
                className="min-h-[600px] w-full font-mono text-sm border-0 focus-visible:ring-0 resize-y p-4 rounded-none"
            />
        ) : (
            <div className="relative">
                 {editor && (
                    <BubbleMenu editor={editor}>
                        <div className="flex items-center gap-1 p-1 rounded-lg border bg-background shadow-lg">
                            <Button variant={editor.isActive('bold') ? "secondary" : "ghost"} size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8" title="Tučně">
                                <Bold className="h-4 w-4" />
                            </Button>
                             <Button variant={editor.isActive('italic') ? "secondary" : "ghost"} size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8" title="Kurzíva">
                                <Italic className="h-4 w-4" />
                            </Button>
                            <Button variant={editor.isActive('link') ? "secondary" : "ghost"} size="icon" onClick={setLink} className="h-8 w-8" title="Odkaz">
                                <LinkIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </BubbleMenu>
                 )}
                <EditorContent editor={editor} />
            </div>
        )}
    </div>
  )
}

