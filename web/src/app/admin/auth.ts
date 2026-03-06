'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_USER = 'admin123'
const ADMIN_PASS = 'admin123'
const ADMIN_COOKIE = 'kkrotan_admin_session'
const ADMIN_SECRET = 'kkrotan_admin_authenticated_2026'

export async function adminLogin(formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const cookieStore = await cookies()
        cookieStore.set(ADMIN_COOKIE, ADMIN_SECRET, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/',
        })
        redirect('/admin')
    }

    return { error: 'Invalid username or password.' }
}

export async function adminLogout() {
    const cookieStore = await cookies()
    cookieStore.delete(ADMIN_COOKIE)
    redirect('/admin/login')
}
