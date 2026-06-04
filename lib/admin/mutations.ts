import type { SupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { deleteImages } from "@/lib/storage-server"

/**
 * The guarded-mutation seam for the admin write path.
 *
 * Every admin feature used to repeat the same shape inline: guard the role, run
 * the query, on delete fetch-then-clean-up images, then call a hand-written list
 * of `revalidatePath`s. This module deepens that into three reusable pieces, all
 * reached through one guarded entry point so NO mutation can run without a guard:
 *
 *   1. {@link guardedMutation} — the entry point. It runs a role guard FIRST and
 *      only then the mutation body, handing the guard's resolved context through.
 *      Each feature declares WHICH guard it uses by passing it in, so every
 *      feature keeps its exact role tier (events → requireEventAccess, staff
 *      surfaces → requireAdmin, admin-only → requireAdminRole).
 *   2. {@link revalidate} — fires `revalidatePath` for a declarative per-feature
 *      path set, replacing the hand-written calls that were copy-pasted inline.
 *   3. {@link deleteWithImageCleanup} + {@link collectImageUrls} — the single
 *      image-cleanup-before-delete, handling BOTH a single `image_url` and a
 *      `gallery_images` array, reused by events/cities/council/posts.
 */

/** Anything a guard resolves to: always at least { supabase }, plus user/role/etc. */
export interface GuardContext {
  supabase: SupabaseClient
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/** A role guard from `lib/auth/guards.ts` — resolves a context or throws. */
export type Guard<C extends GuardContext> = () => Promise<C>

/**
 * THE guarded entry point. Runs `guard` first (its rejection short-circuits the
 * mutation, so a body can never run unguarded), then runs `body` with the guard's
 * resolved context. Returns whatever `body` returns.
 */
export async function guardedMutation<C extends GuardContext, R>(
  guard: Guard<C>,
  body: (ctx: C) => Promise<R>,
): Promise<R> {
  const ctx = await guard()
  return body(ctx)
}

/**
 * A declarative per-feature revalidation set. Each entry is either a plain path
 * (`revalidatePath(path)`) or a `[path, type]` tuple for dynamic routes
 * (`revalidatePath(path, 'page' | 'layout')`).
 */
export type RevalidatePathType = "page" | "layout"
export type RevalidateEntry = string | readonly [string, RevalidatePathType]
export type RevalidateSet = readonly RevalidateEntry[]

/** Fires `revalidatePath` for exactly the declared set — no inline calls per action. */
export function revalidate(paths: RevalidateSet): void {
  for (const entry of paths) {
    if (typeof entry === "string") {
      revalidatePath(entry)
    } else {
      revalidatePath(entry[0], entry[1])
    }
  }
}

/**
 * A row that may own images. Single cover image plus an optional gallery array —
 * this is the exact shape across events, cities, council and posts.
 */
export interface ImageOwningRow {
  image_url?: string | null
  gallery_images?: (string | null | undefined)[] | null
}

/**
 * Collects every image URL a row owns: the single `image_url` first, then each
 * entry of `gallery_images`. Null/absent values are kept as slots — `deleteImages`
 * filters falsy URLs, and existing callers/tests rely on `[null]` being passed for
 * an imageless single-cover row.
 */
export function collectImageUrls(
  row: ImageOwningRow | null | undefined,
): (string | null | undefined)[] {
  if (!row) return []

  const urls: (string | null | undefined)[] = []
  if ("image_url" in row) {
    urls.push(row.image_url ?? null)
  }
  if (Array.isArray(row.gallery_images)) {
    urls.push(...row.gallery_images)
  }
  return urls
}

export interface DeleteWithImageCleanupOptions {
  /** Table to delete from. */
  table: string
  /** Primary key value of the row to delete. */
  id: string
  /**
   * The image columns to fetch for cleanup, as a Supabase `select` string.
   * Single-cover features pass `"image_url"`; gallery features pass
   * `"image_url, gallery_images"`.
   */
  imageColumns: string
  /** Pass `'exact'` to delete with `{ count: 'exact' }` (events need the count). */
  count?: "exact"
  /** Primary key column name. Defaults to `id`. */
  idColumn?: string
}

/** Result of the underlying Supabase delete. */
export interface DeleteResult {
  error: { message: string } | null
  count?: number | null
}

/**
 * The single image-cleanup-before-delete. Fetches the row's image columns,
 * cleans up the collected URLs via the storage proxy, then deletes the row and
 * returns the raw delete result.
 *
 * It deliberately does NOT throw: each feature keeps its own error/`count === 0`
 * handling (events surface a custom RLS message; posts wrap the message) so
 * behaviour is identical to the hand-written code it replaces.
 */
export async function deleteWithImageCleanup(
  supabase: SupabaseClient,
  { table, id, imageColumns, count, idColumn = "id" }: DeleteWithImageCleanupOptions,
): Promise<DeleteResult> {
  // 1. Fetch the row's images.
  const { data: row } = await supabase
    .from(table)
    .select(imageColumns)
    .eq(idColumn, id)
    .single()

  // 2. Clean up its images (the proxy filters falsy URLs).
  if (row) {
    await deleteImages(supabase, collectImageUrls(row as ImageOwningRow))
  }

  // 3. Delete the row and hand the result back to the caller.
  const query = count
    ? supabase.from(table).delete({ count })
    : supabase.from(table).delete()
  return (await query.eq(idColumn, id)) as DeleteResult
}
