'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addProduct(formData: FormData) {
    const name = formData.get('name') as string
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const description = formData.get('description') as string

    const supabase = createClient()
    const { error } = await supabase.from('products').insert([
        { name, slug, price, stock, description, is_active: true }
    ])

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/products')
    revalidatePath('/products')
    return { success: true }
}

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = createClient()
    await supabase.from('orders').update({ status }).eq('id', orderId)
    revalidatePath('/admin/orders')
}
