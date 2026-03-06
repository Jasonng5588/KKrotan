import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_COOKIE = 'kkrotan_admin_session'
const ADMIN_SECRET = 'kkrotan_admin_authenticated_2026'

/**
 * Server-side admin auth check. Call at the top of every admin page.
 * Redirects to /admin/login if not authenticated.
 */
export async function requireAdmin() {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get(ADMIN_COOKIE)?.value === ADMIN_SECRET
    if (!isAdmin) redirect('/admin/login')
}
