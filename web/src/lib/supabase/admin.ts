// Admin Supabase Client - bypasses ALL RLS using service_role key
// Only used in admin server components/actions (never exposed to client)
import { createClient } from '@supabase/supabase-js'

export function adminSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
}
