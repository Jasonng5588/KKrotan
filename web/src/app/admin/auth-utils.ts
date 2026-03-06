// Helper to check admin cookie - NOT a server action, just a utility 
// (no 'use server' directive here)
import { cookies } from 'next/headers'

const ADMIN_COOKIE = 'kkrotan_admin_session'
const ADMIN_SECRET = 'kkrotan_admin_authenticated_2026'

export function isAdminAuthenticated(): boolean {
    try {
        const cookieStore = cookies()
        const session = cookieStore.get(ADMIN_COOKIE)?.value
        return session === ADMIN_SECRET
    } catch {
        return false
    }
}
