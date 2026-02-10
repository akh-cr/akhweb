'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { createCouncilMember, updateCouncilMember } from "./actions"
import { Edit, Plus } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

const formSchema = z.object({
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  role: z.string().min(2, "Role musí mít alespoň 2 znaky"),
  bio: z.string().optional(),
  image_url: z.string().optional(),
  priority: z.coerce.number(),
  active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

type CouncilMember = {
    id: string
    name: string
    role: string
    bio: string | null
    image_url: string | null
    priority: number
    active: boolean
}

export function CouncilMemberDialog({ member }: { member?: CouncilMember }) {
  const [open, setOpen] = useState(false)
  const isEditing = !!member

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member?.name || "",
      role: member?.role || "",
      bio: member?.bio || "",
      image_url: member?.image_url || "",
      priority: member?.priority || 0,
      active: member?.active ?? true,
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && member) {
        await updateCouncilMember(member.id, values)
        toast.success("Člen rady aktualizován")
      } else {
        await createCouncilMember(values)
        toast.success("Člen rady přidán")
        form.reset()
      }
      setOpen(false)
    } catch (error) {
      toast.error("Něco se pokazilo")
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
            <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
            </Button>
        ) : (
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Přidat člena
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Upravit člena rady" : "Přidat člena rady"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Upravte údaje o členovi rady." : "Vložte údaje nového člena rady."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fotografie</FormLabel>
                            <FormControl>
                                <ImageUpload 
                                    value={field.value} 
                                    onChange={field.onChange}
                                    compressionOptions={{
                                        maxSizeMB: 0.5,
                                        maxWidthOrHeight: 500,
                                        useWebWorker: true
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jméno</FormLabel>
                                <FormControl>
                                    <Input placeholder="Jan Novák" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                    <Input placeholder="Předseda" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Krátký popis..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4 items-end">
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priorita (pořadí)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Aktivní
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Ukládání..." : "Uložit"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
