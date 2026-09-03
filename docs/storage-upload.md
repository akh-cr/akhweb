# Image storage architecture

AKH public images use the shared Festapp image control plane and a dedicated
Cloudflare R2 data plane.

| Concern | Canonical owner |
|---|---|
| DB, Auth and roles | AKH Supabase project `iinvsjtnbyxfrdygsfpo` |
| Authenticated upload/delete | `https://image-api.festapp.net` |
| Public image bytes | `https://akh.img.festapp.net` |
| Object persistence | R2 bucket `festapp-images-akhweb` |

## Flow

1. The Next.js server action obtains the signed-in user's AKH access token.
2. It calls `/upload` or `/delete` with `projectId=akhweb`.
3. The image Worker resolves only its server-side AKH project configuration.
4. The Worker verifies the JWT and event-manager role through authenticated-only
   RPC `public.get_can_manage_images()`.
5. The Worker writes or removes the object in the dedicated AKH R2 bucket.

The AKH application never receives R2 credentials. The Worker never accepts a
caller-supplied Supabase origin or key as authority.

## Public key contract

The historical top-level prefixes are retained: `images/`, `blog/` and
`content/`. Object URLs are `https://akh.img.festapp.net/<key>`.

## Application entry points

- `lib/actions/upload-image.ts` keeps the `uploadImageAction(FormData)` API and
  maps the Worker response `url` to `publicUrl` for existing components.
- `lib/storage-server.ts` keeps `deleteImage` / `deleteImages` and sends one
  authorized batch to the Worker.
- `next.config.ts` allows only the canonical AKH image hostname.

## Deployment

The Worker registry, R2 binding, hostname, CORS and tests live in
`festapp/workers/image-worker`. Deploy that Worker before deploying AKH callers.
Apply `20260903190000_authorize_r2_image_control.sql` before deploying the
Worker. Apply `20260903193000_move_akhweb_images_to_r2.sql` only after the source
bucket has been copied, hash-verified and served by the public hostname.

The retired Supabase functions `upload-image-proxy`, `delete-image-proxy`,
`upload-image` and `delete-image` and secret `UPLOAD_SECRET` are not part of the
target architecture.
