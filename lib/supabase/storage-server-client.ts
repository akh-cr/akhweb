import { createClient } from "@supabase/supabase-js";
import { STORAGE_SUPABASE_URL, STORAGE_SUPABASE_ANON_KEY } from "./storage-config";

export function createStorageServerClient() {
  return createClient(STORAGE_SUPABASE_URL, STORAGE_SUPABASE_ANON_KEY);
}
