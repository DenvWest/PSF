import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isValidSupabaseUrl(url: string | undefined): url is string {
  return (
    typeof url === "string" &&
    url.length > 0 &&
    !url.includes("<") &&
    /^https?:\/\//i.test(url)
  );
}

function isValidAnonKey(key: string | undefined): key is string {
  return typeof key === "string" && key.length > 0 && !key.includes("<");
}

/** Placeholders zodat `createClient` niet crasht bij build zonder echte `.env.local`. */
const supabaseUrl = isValidSupabaseUrl(rawUrl)
  ? rawUrl
  : "https://example.supabase.co";
const supabaseKey = isValidAnonKey(rawKey)
  ? rawKey
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.invalid-placeholder";

export const supabase = createClient(supabaseUrl, supabaseKey);
