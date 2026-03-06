'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addToWishlist(productId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('You must be logged in.')

    // Ensure profile exists
    await supabase.from('profiles').upsert(
        [{ id: user.id, email: user.email || '', role: 'customer' }],
        { onConflict: 'id' }
    )

    const { error } = await supabase.from('wishlists').upsert(
        [{ profile_id: user.id, product_id: productId }],
        { onConflict: 'profile_id,product_id' }
    )
    if (error) throw new Error(error.message)

    revalidatePath('/profile/wishlist')
    return { success: true }
}

export async function removeFromWishlist(productId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('You must be logged in.')
    await supabase.from('wishlists').delete().eq('profile_id', user.id).eq('product_id', productId)
    revalidatePath('/profile/wishlist')
}
