'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/app/(store)/cart/actions'
import { addToWishlist } from '@/app/(store)/profile/wishlist/actions'
import { useRouter } from 'next/navigation'

interface ProductActionsProps {
    productId: string
    slug: string
    stock: number
    isLoggedIn: boolean
}

export function ProductActions({ productId, stock, isLoggedIn }: ProductActionsProps) {
    const [qty, setQty] = useState(1)
    const [addingCart, setAddingCart] = useState(false)
    const [addingWish, setAddingWish] = useState(false)
    const [cartSuccess, setCartSuccess] = useState(false)
    const [wishSuccess, setWishSuccess] = useState(false)
    const [error, setError] = useState('')

    async function handleAddToCart() {
        if (!isLoggedIn) { window.location.href = '/login'; return }
        setAddingCart(true)
        setError('')
        try {
            await addToCart(productId, qty)
            setCartSuccess(true)
            setTimeout(() => setCartSuccess(false), 2500)
        } catch (e: any) {
            setError(e.message || 'Failed to add to cart')
        }
        setAddingCart(false)
    }

    async function handleWishlist() {
        if (!isLoggedIn) { window.location.href = '/login'; return }
        setAddingWish(true)
        setError('')
        try {
            await addToWishlist(productId)
            setWishSuccess(true)
            setTimeout(() => setWishSuccess(false), 2500)
        } catch (e: any) {
            setError(e.message || 'Failed to add to wishlist')
        }
        setAddingWish(false)
    }

    if (stock === 0) {
        return (
            <div className="mt-6">
                <Button disabled size="lg" className="w-full h-12 opacity-60">Out of Stock</Button>
            </div>
        )
    }

    return (
        <div className="mt-6 space-y-4">
            {/* Success toasts */}
            {cartSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-3 text-sm font-medium flex items-center gap-2">
                    ✅ Added to cart successfully!
                </div>
            )}
            {wishSuccess && (
                <div className="bg-pink-50 border border-pink-200 text-pink-800 rounded-xl p-3 text-sm font-medium flex items-center gap-2">
                    ♥ Added to wishlist!
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-muted-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="px-4 py-2 text-lg font-bold hover:bg-muted transition-colors"
                    >−</button>
                    <span className="px-6 py-2 font-bold text-lg min-w-[3rem] text-center border-x border-border">{qty}</span>
                    <button
                        type="button"
                        onClick={() => setQty(q => Math.min(stock, q + 1))}
                        className="px-4 py-2 text-lg font-bold hover:bg-muted transition-colors"
                    >+</button>
                </div>
                <span className="text-xs text-muted-foreground">{stock} available</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    onClick={handleAddToCart}
                    disabled={addingCart}
                    size="lg"
                    className="flex-1 h-12 text-base font-semibold"
                >
                    {addingCart ? 'Adding...' : '🛒 Add to Cart'}
                </Button>
                <Button
                    onClick={handleWishlist}
                    disabled={addingWish}
                    variant="outline"
                    size="lg"
                    className="h-12 px-4 text-base"
                    title="Add to Wishlist"
                >
                    {wishSuccess ? '♥' : '♡'} Wishlist
                </Button>
            </div>

            {!isLoggedIn && (
                <p className="text-xs text-muted-foreground text-center">
                    You will be redirected to login before adding to cart.
                </p>
            )}
        </div>
    )
}
