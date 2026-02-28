import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Server Client (Service Role) ────────────────────────────────────────────

let _serverClient: SupabaseClient | null = null;

export function getServerClient(): SupabaseClient {
  if (_serverClient) return _serverClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.",
    );
  }

  _serverClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _serverClient;
}

// ─── Browser Client (Anon Key) ────────────────────────────────────────────────

let _browserClient: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (_browserClient) return _browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
  }

  _browserClient = createClient(url, key);
  return _browserClient;
}
