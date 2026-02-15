# Storage Upload Architecture

## Overview

Image uploads use a two-instance Supabase architecture:

- **Main instance** — database, auth, user roles
- **Storage instance** — dedicated commercial Supabase for image storage (bucket `akhweb`)

Uploads are secured through a chain:
1. Next.js **server action** verifies user is admin/editor (via main instance auth)
2. Server action forwards the file to a Supabase **Edge Function** on the storage instance
3. Edge Function verifies a shared secret header and uploads via `service_role` key
4. The `service_role` key never leaves the Supabase infrastructure

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
  ├─ x-upload-secret header — shared secret
  │
  ▼
Supabase Edge Function (supabase/functions/upload-image/index.ts)
  │
  ├─ Verifies x-upload-secret matches UPLOAD_SECRET env var
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
| `STORAGE_SUPABASE_URL` | URL of the storage Supabase instance | No |
| `STORAGE_SUPABASE_ANON_KEY` | Anon key for storage instance (used for delete operations) | No |
| `UPLOAD_SECRET` | Shared secret between Next.js and Edge Function | No |

### Supabase Edge Function (storage instance secrets)

| Variable | Description | How to set |
|---|---|---|
| `UPLOAD_SECRET` | Must match the value in `.env.local` | Supabase Dashboard > Edge Functions > Secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Supabase | Automatic |
| `SUPABASE_URL` | Auto-provided by Supabase | Automatic |

### Netlify (production)

Add these environment variables in Netlify dashboard (Site settings > Environment variables):

- `STORAGE_SUPABASE_URL`
- `STORAGE_SUPABASE_ANON_KEY`
- `UPLOAD_SECRET`

## File Structure

```
lib/
  actions/
    upload-image.ts          # Server action — auth check + forward to Edge Function
  supabase/
    storage-config.ts        # Storage instance URL, anon key, bucket name
    storage-server-client.ts # Server-side Supabase client for storage (delete operations)

supabase/
  functions/
    upload-image/
      index.ts               # Edge Function — verify secret, upload via service_role
      deno.json               # Import map
  config.toml                # Function config (verify_jwt = false for upload-image)
```

## Upload Flow by Component

| Component | Compression | Server Action | Edge Function |
|---|---|---|---|
| `image-upload.tsx` | Client-side (browser-image-compression) | `uploadImageAction` | `upload-image` |
| `gallery-upload.tsx` | Client-side (parallel) | `uploadImageAction` | `upload-image` |
| `tiptap.tsx` | Client-side + optimistic UI | `uploadImageAction` | `upload-image` |
| `admin/posts/actions.ts` | None (raw file) | `uploadBlogImage` → `uploadImageAction` | `upload-image` |
| `admin/content/actions.ts` | None (raw file) | `uploadContentImage` → `uploadImageAction` | `upload-image` |

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
# Deploy to storage instance
npx supabase functions deploy upload-image --project-ref <storage-project-ref>

# Set the shared secret (via CLI or Dashboard)
npx supabase secrets set UPLOAD_SECRET='<your-secret>' --project-ref <storage-project-ref>
```

If the CLI lacks permissions for secrets, set `UPLOAD_SECRET` manually:
Supabase Dashboard > Project > Edge Functions > Secrets

## Generating a New Upload Secret

```bash
openssl rand -base64 32
```

Update in both places:
1. `.env.local` (and Netlify env vars)
2. Supabase Edge Function secrets (storage instance)

## Security Notes

- `UPLOAD_SECRET` is a symmetric shared secret — rotate it periodically
- Storage env vars (`STORAGE_SUPABASE_URL`, `STORAGE_SUPABASE_ANON_KEY`) are server-side only (no `NEXT_PUBLIC_` prefix)
- The Edge Function has `verify_jwt = false` because the JWT comes from a different Supabase instance
- Authentication is handled by the Next.js server action (`requireAdmin()`) before reaching the Edge Function
- The `service_role` key never leaves the Supabase infrastructure
