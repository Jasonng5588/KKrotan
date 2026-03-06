'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addToCart(productId: string, quantity: number = 1) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('You must be logged in to add to cart.')
    }

    // Ensure profile exists (fixes FK constraint issues)
    await supabase.from('profiles').upsert(
        [{ id: user.id, email: user.email || '', role: 'customer' }],
        { onConflict: 'id' }
    )

    // Check available stock
    const { data: product } = await supabase
        .from('products')
        .select('stock, name')
        .eq('id', productId)
        .single()

    if (!product) throw new Error('Product not found')
    if (product.stock !== null && product.stock < quantity) {
        throw new Error(`Only ${product.stock} units available for ${product.name}`)
    }

    // Get or create cart
    let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle()

    if (!cart) {
        const { data: newCart, error: createError } = await supabase
            .from('carts')
            .insert([{ profile_id: user.id }])
            .select('id')
            .single()
        if (createError) throw new Error(`Cart creation failed: ${createError.message}`)
        cart = newCart
    }

    // Upsert cart item
    const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart!.id)
        .eq('product_id', productId)
        .maybeSingle()

    if (existingItem) {
        const newQty = existingItem.quantity + quantity
        if (product.stock !== null && newQty > product.stock) {
            throw new Error(`Cart total would exceed available stock (${product.stock} units)`)
        }
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQty })
            .eq('id', existingItem.id)
        if (error) throw new Error(`Cart update failed: ${error.message}`)
    } else {
        const { error } = await supabase
            .from('cart_items')
            .insert([{ cart_id: cart!.id, product_id: productId, quantity }])
        if (error) throw new Error(`Cart insert failed: ${error.message}`)
    }

    revalidatePath('/cart')
    return { success: true }
}

export async function removeFromCart(itemId: string) {
    const supabase = createClient()
    await supabase.from('cart_items').delete().eq('id', itemId)
    revalidatePath('/cart')
}

export async function checkout(cartId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not logged in')

    // Get all cart items with products
    const { data: items } = await supabase
        .from('cart_items')
        .select('*, products(id, name, price, stock)')
        .eq('cart_id', cartId)

    if (!items?.length) throw new Error('Cart is empty')

    // Validate stock for all items
    for (const item of items) {
        if (item.products.stock !== null && item.products.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.products.name}. Only ${item.products.stock} available.`)
        }
    }

    const total = items.reduce((acc: number, item: any) => acc + item.quantity * item.products.price, 0)

    // Create order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{ profile_id: user.id, total_amount: total, status: 'pending' }])
        .select('id')
        .single()

    if (orderError || !order) throw new Error(`Order creation failed: ${orderError?.message}`)

    // Insert order items AND deduct stock
    for (const item of items) {
        await supabase.from('order_items').insert([{
            order_id: order.id,
            product_id: item.products.id,
            quantity: item.quantity,
            price: item.products.price,
        }])

        // Deduct stock in real-time
        await supabase
            .from('products')
            .update({ stock: Math.max(0, item.products.stock - item.quantity) })
            .eq('id', item.products.id)
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('cart_id', cartId)

    revalidatePath('/cart')
    revalidatePath('/profile/orders')
    revalidatePath('/products')
    return { success: true, orderId: order.id }
}
