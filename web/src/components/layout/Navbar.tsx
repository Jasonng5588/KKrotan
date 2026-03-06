import { createClient } from '@/lib/supabase/server'
import { NavbarClient } from './NavbarClient'

export async function Navbar() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return <NavbarClient isLoggedIn={!!user} />
}
