'use server'

import { adminSupabase } from '@/lib/supabase/admin'

export async function submitContact(formData: FormData) {
    const name = `${formData.get('firstName')} ${formData.get('lastName')}`
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const messageContent = formData.get('message') as string

    // Construct a rich message that includes the email/subject since quotes table doesn't have an email column directly for guests
    const fullMessage = `From: ${name} (${email})\nSubject: ${subject}\n\n${messageContent}`

    const supabase = adminSupabase()

    // Attempt to find a profile if they used a registered email, but we'll insert as guest if not
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle()

    const { error } = await supabase.from('quotes').insert([{
        profile_id: profile?.id || null, // Link to profile if it exists
        company_name: subject, // Using subject as company name proxy for admin visibility
        phone: 'Provided via Email', // Dummy phone until we add an actual phone field to the contact form
        message: fullMessage,
        status: 'pending'
    }])

    if (error) {
        throw new Error(error.message)
    }

    return { success: true }
}
