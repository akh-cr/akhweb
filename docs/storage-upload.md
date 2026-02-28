# Storage Upload Architecture

## Overview

Image uploads use a two-instance Supabase architecture:

- **Main instance** — database, auth, user roles
- **Storage instance** — dedicated commercial Supabase for image storage (bucket `akhweb`)

Uploads are secured through a chain:
1. Next.js **server action** verifies user is admin/editor (via main instance auth)
2. Server action forwards the file to a public **Edge Function** on the main AKH Supabase instance with the user's access token
3. The main Edge Function re-validates the user's JWT and role, then forwards the file to the storage instance using a Supabase-only shared secret
4. The storage Edge Function uploads via `service_role` key
5. The shared secret and `service_role` key never leave the Supabase infrastructure

## Architecture Diagram

```
Browser (client-side compression)
  │
  ├─ browser-image-compression (max 1MB, 1920px)
  │
  ▼
Next.js Server Action (lib/actions/upload-image.ts)
  │
  ├─ requireAdmin() — checks auth on main Supabase instance
  ├─ Authorization: Bearer <user access token>
  │
  ▼
Main Supabase Edge Function (supabase/functions/upload-image-proxy/index.ts)
  │
  ├─ Validates the JWT against the main AKH Supabase instance
  ├─ Confirms the user has role admin/editor
  ├─ Forwards to storage function with x-upload-secret
  │
  ▼
Storage Supabase Edge Function (supabase/functions/upload-image/index.ts)
  │
  ├─ Verifies x-upload-secret matches UPLOAD_SECRET
  ├─ Uploads to bucket 'akhweb' via SUPABASE_SERVICE_ROLE_KEY
  │
  ▼
Supabase Storage (commercial instance)
  └─ Returns public URL
```

## Environment Variables

### Next.js Application (`.env.local`)

| Variable | Description | Exposed to browser? |
|---|---|---|
| `STORAGE_SUPABASE_ANON_KEY` | Anon key for storage instance (used for delete operations) | No |

### Supabase Edge Function (main AKH instance secrets)

| Variable | Description | How to set |
|---|---|---|
| `UPLOAD_SECRET` | Shared secret used only for proxying to the storage function | Supabase Dashboard > Edge Functions > Secrets |
| `STORAGE_SUPABASE_URL` | Optional override for the storage Supabase URL | Supabase Dashboard > Edge Functions > Secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Supabase | Automatic |
| `SUPABASE_URL` | Auto-provided by Supabase | Automatic |

### Supabase Edge Function (storage instance secrets)

| Variable | Description | How to set |
|---|---|---|
| `UPLOAD_SECRET` | Must match the main AKH instance `UPLOAD_SECRET` | Supabase Dashboard > Edge Functions > Secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Supabase | Automatic |
| `SUPABASE_URL` | Auto-provided by Supabase | Automatic |

### Netlify (production)

Add these environment variables in Netlify dashboard (Site settings > Environment variables):

- `STORAGE_SUPABASE_ANON_KEY`

## File Structure

```
lib/
  actions/
    upload-image.ts          # Server action — auth check + forward to main AKH Edge Function
  supabase/
    storage-config.ts        # Storage instance URL, anon key, bucket name
    storage-server-client.ts # Server-side Supabase client for storage (delete operations)

supabase/
  functions/
    upload-image/
      index.ts               # Storage Edge Function — verify shared secret, upload via service_role
    upload-image-proxy/
      index.ts               # Main AKH Edge Function — verify JWT + role, forward to storage
      deno.json               # Import map
  config.toml                # Function config
```

## Upload Flow by Component

| Component | Compression | Server Action | Edge Function |
|---|---|---|---|
| `image-upload.tsx` | Client-side (browser-image-compression) | `uploadImageAction` | `upload-image-proxy` |
| `gallery-upload.tsx` | Client-side (parallel) | `uploadImageAction` | `upload-image-proxy` |
| `tiptap.tsx` | Client-side + optimistic UI | `uploadImageAction` | `upload-image-proxy` |
| `admin/posts/actions.ts` | None (raw file) | `uploadBlogImage` → `uploadImageAction` | `upload-image-proxy` |
| `admin/content/actions.ts` | None (raw file) | `uploadContentImage` → `uploadImageAction` | `upload-image-proxy` |

## Storage Path Convention

All files are stored in bucket `akhweb` with path structure:

```
akhweb/
  images/uploads/   — general image uploads (cities, events, council members)
  blog/images/      — blog post images
  content/gallery/  — content block gallery images
```

## Deploying the Edge Function

```bash
# Deploy to main AKH instance
npx supabase functions deploy upload-image-proxy --project-ref <main-project-ref>

# Deploy to storage instance
npx supabase functions deploy upload-image --project-ref <storage-project-ref>
```

## Security Notes

- Netlify does not need `UPLOAD_SECRET` or `STORAGE_SUPABASE_URL`; it only calls the main AKH Supabase function
- Storage env vars (`STORAGE_SUPABASE_URL`, `STORAGE_SUPABASE_ANON_KEY`) are server-side only (no `NEXT_PUBLIC_` prefix)
- The main AKH proxy function keeps `verify_jwt = false` and validates the user token explicitly before forwarding
- The storage Edge Function accepts traffic only from the AKH proxy function via `UPLOAD_SECRET`
- The shared secret and `service_role` key never leave Supabase infrastructure
