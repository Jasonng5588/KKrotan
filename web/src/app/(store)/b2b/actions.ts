'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitQuote(formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to request a wholesale quote.' }
    }

    // Ensure profile exists (fixes FK constraint)
    await supabase.from('profiles').upsert(
        [{ id: user.id, email: user.email || '', role: 'customer' }],
        { onConflict: 'id' }
    )

    const company_name = formData.get('company_name') as string
    const phone = formData.get('phone') as string
    const message = formData.get('message') as string

    if (!phone || !message) {
        return { error: 'Phone and message are required.' }
    }

    const { error } = await supabase.from('quotes').insert([
        { profile_id: user.id, company_name, phone, message, status: 'pending' }
    ])

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/profile/quotes')
    return { success: true }
}
