'use client';

import { useState } from 'react';
import { updateContentBlock, uploadContentImage } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Loader2, Plus, Trash, Upload, Save } from 'lucide-react';
import { GalleryUpload } from '@/components/gallery-upload';
import { ImageUpload } from '@/components/image-upload';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import { ContentBlock } from '@/lib/content';

function getBlockUrl(blockId: string): string {
    const [page] = blockId.split('.');
    switch (page) {
        case 'home': return '/';
        case 'spolecenstvi': return '/spolecenstvi';
        case 'akce': return '/akce';
        case 'spoluprace': return '/spoluprace';
        case 'kontakt': return '/kontakt';
        case 'o-nas': return '/o-nas';
        default: return '/';
    }
}

export function ContentEditor({ initialBlocks }: { initialBlocks: ContentBlock[] }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [dirtyBlocks, setDirtyBlocks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpdate = (id: string, newContent: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: newContent } : b));
    setDirtyBlocks(prev => new Set(prev).add(id));
  };

  const handleSave = async (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    setLoading(id);
    try {
        await updateContentBlock(id, block.content);
        setDirtyBlocks(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        toast.success('Uloženo');
    } catch (e) {
        console.error(e);
        toast.error('Chyba při ukládání');
    } finally {
        setLoading(null);
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', 'gallery'); // Folder in 'content' bucket

    try {
         const result = await uploadContentImage(formData);
         return result.publicUrl;
    } catch (e) {
        console.error(e);
        throw e;
    }
  };


  return (
    <div className="grid gap-6">
      {blocks.map((block) => (
        <Card key={block.id} className={dirtyBlocks.has(block.id) ? "border-yellow-500" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold">{block.id}</CardTitle>
                {dirtyBlocks.has(block.id) && <span className="text-xs text-yellow-600 font-medium">(Neuloženo)</span>}
            </div>
            <div className="flex items-center gap-2">
                <Link href={getBlockUrl(block.id)} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" title="Zobrazit na webu">
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </Link>
                <Button 
                    size="sm" 
                    onClick={() => handleSave(block.id)}
                    disabled={!dirtyBlocks.has(block.id) || loading === block.id}
                    variant={dirtyBlocks.has(block.id) ? "default" : "outline"}
                >
                    {loading === block.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Uložit
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            {block.type === 'text' && (
              <div className="space-y-4">
                <div>
                    <Label>Hlavní text</Label>
                    <Textarea 
                        value={block.content.text} 
                        onChange={(e) => handleUpdate(block.id, { ...block.content, text: e.target.value })}
                        rows={5}
                    />
                </div>
                 <div>
                    <Label>Body (seznam)</Label>
                    {(block.content.items || []).map((item: string, i: number) => (
                        <div key={i} className="flex gap-2 mb-2">
                            <Input 
                                value={item} 
                                onChange={(e) => {
                                    const newItems = [...(block.content.items || [])];
                                    newItems[i] = e.target.value;
                                    handleUpdate(block.id, { ...block.content, items: newItems });
                                }}
                            />
                            <Button variant="destructive" size="icon" onClick={() => {
                                  const newItems = (block.content.items || []).filter((_: any, idx: number) => idx !== i);
                                  handleUpdate(block.id, { ...block.content, items: newItems });
                            }}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                        <Button variant="outline" size="sm" onClick={() => {
                            handleUpdate(block.id, { ...block.content, items: [...(block.content.items || []), ""] });
                        }}>
                        <Plus className="mr-2 h-4 w-4" /> Přidat bod
                    </Button>
                </div>
              </div>
            )}

            {block.type === 'video' && (
              <div className="space-y-4">
                <div>
                  <Label>YouTube ID</Label>
                  <Input 
                    value={block.content.videoId} 
                    onChange={(e) => handleUpdate(block.id, { ...block.content, videoId: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Titulek</Label>
                  <Input 
                    value={block.content.title} 
                    onChange={(e) => handleUpdate(block.id, { ...block.content, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Popis</Label>
                  <Textarea 
                    value={block.content.description} 
                    onChange={(e) => handleUpdate(block.id, { ...block.content, description: e.target.value })}
                  />
                </div>
              </div>
            )}

            {block.type === 'header' && (
              <div className="space-y-4">
                <div>
                  <Label>Titulek</Label>
                  <Input 
                    value={block.content.title} 
                    onChange={(e) => handleUpdate(block.id, { ...block.content, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Podtitulek</Label>
                  <Textarea 
                    value={block.content.subtitle} 
                    onChange={(e) => handleUpdate(block.id, { ...block.content, subtitle: e.target.value })}
                  />
                </div>
                 <div>
                    <Label>Pozadí (Obrázek)</Label>
                    <ImageUpload
                        value={block.content.image}
                        onChange={(url) => handleUpdate(block.id, { ...block.content, image: url })}
                        compressionOptions={{ maxWidthOrHeight: 1920, maxSizeMB: 1 }}
                    />
                </div>
              </div>
            )}

            {block.type === 'rich_text' && (
                <div className="space-y-4">
                    <Label>Obsah (HTML)</Label>
                    <Textarea 
                        className="font-mono text-sm"
                        rows={10}
                        value={block.content.content} 
                        onChange={(e) => handleUpdate(block.id, { ...block.content, content: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Podporuje základní HTML tagy.</p>
                </div>
            )}

            {block.type === 'text_image' && (
              <div className="space-y-4">
                 <div>
                  <Label>Nadpis</Label>
                  <Input 
                    value={block.content.title} 
                    onChange={(e) => handleUpdate(block.id, { ...block.content, title: e.target.value })}
                  />
                </div>
                 <div>
                  <Label>Text</Label>
                  <Textarea 
                    value={block.content.text} 
                    onChange={(e) => handleUpdate(block.id, { ...block.content, text: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                    <Label>Body (seznam)</Label>
                    {(block.content.items || []).map((item: string, i: number) => (
                        <div key={i} className="flex gap-2 mb-2">
                            <Input 
                                value={item} 
                                onChange={(e) => {
                                    const newItems = [...(block.content.items || [])];
                                    newItems[i] = e.target.value;
                                    handleUpdate(block.id, { ...block.content, items: newItems });
                                }}
                            />
                            <Button variant="destructive" size="icon" onClick={() => {
                                  const newItems = (block.content.items || []).filter((_: any, idx: number) => idx !== i);
                                  handleUpdate(block.id, { ...block.content, items: newItems });
                            }}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                        <Button variant="outline" size="sm" onClick={() => {
                            handleUpdate(block.id, { ...block.content, items: [...(block.content.items || []), ""] });
                        }}>
                        <Plus className="mr-2 h-4 w-4" /> Přidat bod
                    </Button>
                </div>
                  <div>
                    <Label>Obrázek</Label>
                    <ImageUpload
                        value={block.content.image}
                        onChange={(url) => handleUpdate(block.id, { ...block.content, image: url })}
                         compressionOptions={{ maxWidthOrHeight: 1200, maxSizeMB: 1 }}
                    />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Tlačítko - Text</Label>
                        <Input 
                            value={block.content.ctaText} 
                            onChange={(e) => handleUpdate(block.id, { ...block.content, ctaText: e.target.value })}
                        />
                    </div>
                     <div>
                        <Label>Tlačítko - Odkaz</Label>
                        <Input 
                            value={block.content.ctaLink} 
                            onChange={(e) => handleUpdate(block.id, { ...block.content, ctaLink: e.target.value })}
                        />
                    </div>
                 </div>
              </div>
            )}

            {block.type === 'partners' && (
              <div className="space-y-4">
                  <Label>Partneři a odkazy</Label>
                   {block.content.links.map((link: any, i: number) => (
                      <div key={i} className="mb-4 p-4 border rounded relative">
                          <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 text-destructive"
                                onClick={() => {
                                      const newLinks = block.content.links.filter((_: any, idx: number) => idx !== i);
                                      handleUpdate(block.id, { ...block.content, links: newLinks });
                                }}
                          >
                              <Trash className="h-4 w-4" />
                          </Button>
                          <div className="grid gap-2 mb-2">
                              <Label>Název</Label>
                              <Input 
                                  value={link.title} 
                                  onChange={(e) => {
                                      const newLinks = [...block.content.links];
                                      newLinks[i] = { ...newLinks[i], title: e.target.value };
                                      handleUpdate(block.id, { ...block.content, links: newLinks });
                                  }}
                              />
                          </div>
                          <div className="grid gap-2 mb-2">
                              <Label>URL</Label>
                              <Input 
                                  value={link.url} 
                                  onChange={(e) => {
                                      const newLinks = [...block.content.links];
                                      newLinks[i] = { ...newLinks[i], url: e.target.value };
                                      handleUpdate(block.id, { ...block.content, links: newLinks });
                                  }}
                              />
                          </div>
                          <div className="grid gap-2">
                               <Label>Sekundární odkaz (volitelné)</Label>
                               <div className="flex gap-2">
                                   <Input 
                                      placeholder="Název"
                                      value={link.secondary?.title || ''} 
                                      onChange={(e) => {
                                          const newLinks = [...block.content.links];
                                          const currentSecondary = newLinks[i].secondary || { title: '', url: '' };
                                          newLinks[i] = { 
                                            ...newLinks[i], 
                                            secondary: { ...currentSecondary, title: e.target.value } 
                                          };
                                          handleUpdate(block.id, { ...block.content, links: newLinks });
                                      }}
                                  />
                                   <Input 
                                      placeholder="URL"
                                      value={link.secondary?.url || ''} 
                                      onChange={(e) => {
                                          const newLinks = [...block.content.links];
                                          const currentSecondary = newLinks[i].secondary || { title: '', url: '' };
                                          newLinks[i] = { 
                                            ...newLinks[i], 
                                            secondary: { ...currentSecondary, url: e.target.value } 
                                          };
                                          handleUpdate(block.id, { ...block.content, links: newLinks });
                                      }}
                                  />
                               </div>
                          </div>
                      </div>
                   ))}
                   <Button variant="outline" size="sm" onClick={() => {
                        handleUpdate(block.id, { ...block.content, links: [...block.content.links, { title: "", url: "" }] });
                   }}>
                      <Plus className="mr-2 h-4 w-4" /> Přidat partnera
                  </Button>
              </div>
            )}

            {block.type === 'contact_details' && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                            value={block.content.email} 
                            onChange={(e) => handleUpdate(block.id, { ...block.content, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Číslo účtu</Label>
                        <Input 
                            value={block.content.bankAccount} 
                            onChange={(e) => handleUpdate(block.id, { ...block.content, bankAccount: e.target.value })}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Adresa (řádky)</Label>
                        {block.content.address.map((line: string, i: number) => (
                             <div key={i} className="flex gap-2">
                                <Input 
                                    value={line} 
                                    onChange={(e) => {
                                        const newAddress = [...block.content.address];
                                        newAddress[i] = e.target.value;
                                        handleUpdate(block.id, { ...block.content, address: newAddress });
                                    }}
                                />
                                <Button variant="ghost" size="icon" onClick={() => {
                                     const newAddress = block.content.address.filter((_: any, idx: number) => idx !== i);
                                     handleUpdate(block.id, { ...block.content, address: newAddress });
                                }}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                             </div>
                        ))}
                         <Button variant="outline" size="sm" onClick={() => {
                              handleUpdate(block.id, { ...block.content, address: [...block.content.address, ""] });
                         }}>
                            <Plus className="mr-2 h-4 w-4" /> Přidat řádek adresy
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Lidé</Label>
                         {block.content.people.map((person: any, i: number) => (
                             <div key={i} className="border p-4 rounded mb-2 relative">
                                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => {
                                     const newPeople = block.content.people.filter((_: any, idx: number) => idx !== i);
                                     handleUpdate(block.id, { ...block.content, people: newPeople });
                                }}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                                 <div className="grid grid-cols-2 gap-2">
                                     <div>
                                         <Label>Jméno</Label>
                                         <Input 
                                            value={person.name} 
                                            onChange={(e) => {
                                                const newPeople = [...block.content.people];
                                                newPeople[i] = { ...newPeople[i], name: e.target.value };
                                                handleUpdate(block.id, { ...block.content, people: newPeople });
                                            }}
                                         />
                                     </div>
                                     <div>
                                         <Label>Role</Label>
                                         <Input 
                                            value={person.role} 
                                            onChange={(e) => {
                                                const newPeople = [...block.content.people];
                                                newPeople[i] = { ...newPeople[i], role: e.target.value };
                                                handleUpdate(block.id, { ...block.content, people: newPeople });
                                            }}
                                         />
                                     </div>
                                     <div>
                                         <Label>Telefon</Label>
                                         <Input 
                                            value={person.phone || ''} 
                                            onChange={(e) => {
                                                const newPeople = [...block.content.people];
                                                newPeople[i] = { ...newPeople[i], phone: e.target.value };
                                                handleUpdate(block.id, { ...block.content, people: newPeople });
                                            }}
                                         />
                                     </div>
                                     <div>
                                         <Label>Iniciály (Avatar)</Label>
                                         <Input 
                                            value={person.image || ''} 
                                            onChange={(e) => {
                                                const newPeople = [...block.content.people];
                                                newPeople[i] = { ...newPeople[i], image: e.target.value };
                                                handleUpdate(block.id, { ...block.content, people: newPeople });
                                            }}
                                         />
                                     </div>
                                 </div>
                             </div>
                         ))}
                    </div>
                </div>
            )}

            {block.type === 'gallery' && (
              <div className="space-y-4">
                <GalleryUpload 
                    value={block.content.images}
                    onChange={(newImages) => handleUpdate(block.id, { ...block.content, images: newImages })}
                    bucket="content"
                    folder="gallery"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
