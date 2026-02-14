import { createBrowserClient } from "@supabase/ssr";
import { STORAGE_SUPABASE_URL, STORAGE_SUPABASE_ANON_KEY } from "./storage-config";

export function createStorageClient() {
  return createBrowserClient(STORAGE_SUPABASE_URL, STORAGE_SUPABASE_ANON_KEY);
}
