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
import { toast } from "sonner"
import { uploadImage } from '@/lib/storage'

export default function Tiptap({ content, onChange }: { content: string, onChange: (html: string) => void }) {
  const [isSourceMode, setIsSourceMode] = useState(false)
  const [sourceCode, setSourceCode] = useState(content)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Ref to access editor inside uploadFile (which is defined before editor)
  const editorRef = useRef<ReturnType<typeof useEditor>>(null)

  // Extract upload logic - Defined BEFORE useEditor to avoid ReferenceError
  const uploadFile = async (file: File) => {
    setIsUploading(true)
    const currentEditor = editorRef.current
    
    // 1. Optimistic UI: Show image immediately
    const blobUrl = URL.createObjectURL(file)
    currentEditor?.chain().focus().setImage({ src: blobUrl }).run()

    try {
        const publicUrl = await uploadImage(file, {
            bucket: 'images',
            compression: {
                maxSizeMB: 1, 
                maxWidthOrHeight: 1920,
                useWebWorker: true
            }
        })
        
        console.log("Upload successful:", { publicUrl });

        if (!publicUrl) {
             throw new Error("No public URL returned from Supabase");
        }

        // 2. Update the image source from Blob URL to Public URL
        if (currentEditor) {
            const { view } = currentEditor;
            const { state } = view;
            
            let posToDelete = -1;
            
            // Find the node position
            state.doc.descendants((node, pos) => {
                if (node.type.name === 'image' && node.attrs.src === blobUrl) {
                    posToDelete = pos;
                    return false; // Stop iteration
                }
                return true;
            });

            if (posToDelete > -1) {
                console.log("Replacing blobUrl with publicUrl at pos:", posToDelete);
                
                // Method 1: Update attributes (smoother)
                // We select the node, then update its attributes
                currentEditor.chain()
                    .command(({ tr }) => {
                        tr.setNodeMarkup(posToDelete, undefined, { src: publicUrl });
                        return true;
                    })
                    .run();

                toast.success("Obrázek byl úspěšně nahrazen");
            } else {
                 console.warn("Could not find image node with blobUrl:", blobUrl);
                 // Fallback: Just insert it at current cursor
                 currentEditor.chain().focus().setImage({ src: publicUrl }).run();
            }
        }
        
        // toast.success("Obrázek byl nahrán: " + publicUrl) // Debug URL

    } catch (error) {
        console.error('Upload failed details:', error)
        const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba'
        toast.error(`Chyba nahrávání: ${errorMessage}`)
        
        // Revert optimistic update on failure
        if (currentEditor) {
            const { state, view } = currentEditor
             state.doc.descendants((node, pos) => {
                if (node.type.name === 'image' && node.attrs.src === blobUrl) {
                    const transaction = state.tr.delete(pos, pos + node.nodeSize)
                    view.dispatch(transaction)
                    return false
                }
                return true
            })
        }

    } finally {
        setIsUploading(false)
        // URL.revokeObjectURL(blobUrl) // disable revocation for debugging - possible race condition
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }
  }

  const editor = useEditor({
    extensions: [
        StarterKit,
        Image.configure({
            HTMLAttributes: {
                class: 'rounded-lg border shadow-sm max-w-full h-auto my-4',
            },
        }),

        Youtube.configure({
            controls: false,
            HTMLAttributes: {
                class: 'rounded-lg overflow-hidden border shadow-sm my-4 w-full aspect-video',
            },
        }),
        Link.configure({
            openOnClick: false,
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
        },
        handleDrop: (view, event: DragEvent, slice, moved) => {
            if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                const file = event.dataTransfer.files[0];
                if (file.type.startsWith('image/')) {
                    uploadFile(file);
                    return true;
                }
            }
            return false;
        }
    }
  })

  // We need to cleanup the object URL to avoid memory leaks
  // although mostly handled by browser, good practice if we were using createObjectURL heavily
  
  // Sync editor instance to ref
  useEffect(() => {
     editorRef.current = editor
  }, [editor])

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

  /* eslint-disable @next/next/no-img-element */ 
  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editor) {
        uploadFile(file)
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
        <div className="flex items-center gap-1 p-2 bg-muted/40 border-b overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <Toggle pressed={!isSourceMode} onPressedChange={() => setIsSourceMode(false)} aria-label="Visual Editor" size="sm" className="shrink-0">
                <Type className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Vizuální</span>
            </Toggle>
            <Toggle pressed={isSourceMode} onPressedChange={() => setIsSourceMode(true)} aria-label="Source Code" size="sm" className="shrink-0">
                <Code className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">HTML Zdroj</span>
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-2 shrink-0" />

            {!isSourceMode && (
                <>
                    <Button variant={editor.isActive('bold') ? "secondary" : "ghost"} size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 shrink-0">
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant={editor.isActive('italic') ? "secondary" : "ghost"} size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8 shrink-0">
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant={editor.isActive('link') ? "secondary" : "ghost"} size="icon" onClick={setLink} className="h-8 w-8 shrink-0">
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    
                    <Separator orientation="vertical" className="h-6 mx-2 shrink-0" />

                    <Button variant={editor.isActive('heading', { level: 2 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-8 px-2 font-bold shrink-0">
                        H2
                    </Button>
                     <Button variant={editor.isActive('heading', { level: 3 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="h-8 px-2 font-bold shrink-0">
                        H3
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-2 shrink-0" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="sm" className="h-8 gap-2 shrink-0" disabled={isUploading}>
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

                     <div className="ml-auto flex gap-1 shrink-0">
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

