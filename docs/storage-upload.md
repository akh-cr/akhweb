# Storage Upload Architecture

## Overview

Image uploads use a two-instance Supabase architecture:

- **Main instance** — database, auth, user roles
- **Storage instance** — dedicated commercial Supabase for image storage (bucket `akhweb`)

Uploads are secured through a chain:
1. Next.js **server action** verifies user is admin/editor (via main instance auth)
2. Server action forwards the file to a Supabase **Edge Function** on the storage instance with the user's access token
3. Edge Function re-validates the user's JWT and role against the main AKH Supabase instance, then uploads via `service_role` key
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
  ├─ Authorization: Bearer <user access token>
  │
  ▼
Supabase Edge Function (supabase/functions/upload-image/index.ts)
  │
  ├─ Validates the JWT against the main AKH Supabase instance
  ├─ Confirms the user has role admin/editor
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
| `STORAGE_SUPABASE_URL` | URL of the storage Supabase instance (optional; falls back to `NEXT_PUBLIC_SUPABASE_URL`) | No |
| `STORAGE_SUPABASE_ANON_KEY` | Anon key for storage instance (used for delete operations) | No |

### Supabase Edge Function (storage instance secrets)

| Variable | Description | How to set |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Supabase | Automatic |
| `SUPABASE_URL` | Auto-provided by Supabase | Automatic |
| `AKH_SUPABASE_URL` | Optional override for the main AKH Supabase URL | Supabase Dashboard > Edge Functions > Secrets |
| `AKH_SUPABASE_ANON_KEY` | Optional override for the main AKH Supabase anon key | Supabase Dashboard > Edge Functions > Secrets |

### Netlify (production)

Add these environment variables in Netlify dashboard (Site settings > Environment variables):

- `STORAGE_SUPABASE_ANON_KEY`

`STORAGE_SUPABASE_URL` is only required when uploads should target a different Supabase project than the main app. If it is omitted, the app falls back to `NEXT_PUBLIC_SUPABASE_URL`.

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
      index.ts               # Edge Function — verify JWT + role, upload via service_role
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
```

## Security Notes

- Netlify does not need a shared upload secret; authorization is derived from the logged-in user's JWT
- Storage env vars (`STORAGE_SUPABASE_URL`, `STORAGE_SUPABASE_ANON_KEY`) are server-side only (no `NEXT_PUBLIC_` prefix)
- The Edge Function keeps `verify_jwt = false` because the JWT comes from a different Supabase instance, so it validates the token explicitly in userland
- Authentication is checked twice: once in the Next.js server action and again inside the storage Edge Function
- The `service_role` key never leaves the Supabase infrastructure
