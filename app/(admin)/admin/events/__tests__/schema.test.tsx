import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'

// Duplicate the schema from event-form.tsx for testing isolation
// We will test if this schema rejects potential URLs
const formSchema = z.object({
  title: z.string().min(2),
  image_url: z.string().refine((val) => {
      if (val === "") return true;
      if (val.startsWith("/")) return true; // Allow relative URLs
      if (val.startsWith("blob:")) return true; // Explicitly allow blobs
      try {
          new URL(val);
          return true;
      } catch {
          return false;
      }
  }, { message: "Neplatná URL" }).optional().or(z.literal("")),
})

describe('Event Form Validation', () => {
    it('accepts valid https URLs', () => {
        const result = formSchema.safeParse({
            title: 'Test Event',
            image_url: 'https://iinvsjtnbyxfrdygsfpo.supabase.co/storage/v1/object/public/images/uploads/test.jpg'
        })
        expect(result.success).toBe(true)
    })

    it('accepts blob URLs (optimistic UI)', () => {
        // This is where we expect failure if z.string().url() is too strict for blob:
        const result = formSchema.safeParse({
            title: 'Test Event',
            image_url: 'blob:http://localhost:3000/1234-5678-9012'
        })
        expect(result.success).toBe(true) 
    })

    it('rejects invalid URLs', () => {
        const result = formSchema.safeParse({
            title: 'Test Event',
            image_url: 'not-a-url'
        })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe("Neplatná URL")
        }
    })

    it('accepts URLs with spaces (permissive)', () => {
        const result = formSchema.safeParse({
            title: 'Test Event',
            image_url: 'https://example.com/image with spaces.jpg'
        })
        expect(result.success).toBe(true)
    })
    
    it('accepts relative URLs (proxied or local)', () => {
        const result = formSchema.safeParse({
            title: 'Test Event',
            image_url: '/storage/v1/object/public/images/test.jpg'
        })
        expect(result.success).toBe(true)
    })

    it('rejects just a filename', () => {
        const result = formSchema.safeParse({
            title: 'Test Event',
            image_url: 'image.jpg'
        })
        expect(result.success).toBe(false)
    })

    it('accepts empty string (optional)', () => {
        const result = formSchema.safeParse({
            title: 'Test Event',
            image_url: ''
        })
        expect(result.success).toBe(true)
    })
})
