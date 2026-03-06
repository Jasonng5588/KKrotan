'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function ProductReviews({
    productId,
    initialReviews,
    isLoggedIn
}: {
    productId: string,
    initialReviews: any[],
    isLoggedIn: boolean
}) {
    const router = useRouter()
    const supabase = createClient()
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!isLoggedIn) {
            setError('You must be logged in to leave a review.')
            return
        }
        if (!comment.trim()) {
            setError('Please write a comment.')
            return
        }

        setLoading(true)
        setError('')

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setError('Authentication error.')
            setLoading(false)
            return
        }

        const { error: insertError } = await supabase.from('reviews').insert({
            product_id: productId,
            profile_id: user.id,
            rating,
            comment
        })

        if (insertError) {
            setError(insertError.message)
        } else {
            setComment('')
            setRating(5)
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="mt-20 border-t pt-10">
            <h2 className="text-3xl font-bold mb-8 text-slate-800">Customer Reviews</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-6">
                    {initialReviews.length === 0 ? (
                        <p className="text-slate-500 italic">No reviews yet. Be the first to review this product!</p>
                    ) : (
                        initialReviews.map(r => (
                            <div key={r.id} className="p-6 bg-slate-50 rounded-2xl border">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-slate-800">{r.profiles?.first_name} {r.profiles?.last_name || 'Customer'}</p>
                                        <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-amber-500 font-bold">
                                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                    </div>
                                </div>
                                <p className="text-slate-700 mt-3">{r.comment}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Write a Review</h3>
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`text-2xl ${rating >= star ? 'text-amber-500' : 'text-slate-200'} hover:text-amber-400 transition-colors`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Your Review *</label>
                            <Textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="What did you like or dislike?"
                                className="min-h-[120px] bg-slate-50"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-700" disabled={loading || !isLoggedIn}>
                            {loading ? 'Submitting...' : isLoggedIn ? 'Submit Review' : 'Login to Review'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
