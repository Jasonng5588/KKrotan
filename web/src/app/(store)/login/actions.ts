'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required.' }
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
            return { error: 'Please check your email and click the confirmation link first. You can also disable email confirmation in your Supabase Dashboard → Authentication → Providers → Email.' }
        }
        if (error.message.toLowerCase().includes('invalid login credentials')) {
            return { error: 'Wrong email or password. Please try again.' }
        }
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    if (!email || !password) {
        return { error: 'Email and password are required.' }
    }
    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters.' }
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
            return { error: 'This email is already registered. Please log in instead.' }
        }
        return { error: error.message }
    }

    if (data.user) {
        await supabase.from('profiles').upsert([{
            id: data.user.id,
            email,
            first_name: firstName || '',
            last_name: lastName || '',
            role: 'customer'
        }])
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
