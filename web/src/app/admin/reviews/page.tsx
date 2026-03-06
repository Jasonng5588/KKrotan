import { redirect } from 'next/navigation'
import { requireAdmin } from '../auth-utils'
import { adminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export const revalidate = 0

async function deleteReview(id: string) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('reviews').delete().eq('id', id)
    revalidatePath('/admin/reviews')
}

export default async function AdminReviewsPage() {
    await requireAdmin()

    const supabase = adminSupabase()
    const { data: reviews } = await supabase
        .from('reviews')
        .select('*, profiles(email, first_name, last_name), products(name)')
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Reviews</h1>
                <p className="text-slate-500 mt-1">{reviews?.length || 0} total reviews</p>
            </div>

            <div className="space-y-4">
                {reviews?.map((r: any) => (
                    <div key={r.id} className="bg-white border rounded-xl shadow-sm p-5 flex gap-4 items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex">{'⭐'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                                <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">{r.profiles?.first_name} {r.profiles?.last_name} <span className="font-normal text-slate-400">on {r.products?.name}</span></p>
                            <p className="text-xs text-slate-400 mb-2">{r.profiles?.email}</p>
                            {r.comment && <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{r.comment}</p>}
                        </div>
                        <form action={deleteReview.bind(null, r.id)}>
                            <button type="submit" className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg flex-shrink-0">Delete</button>
                        </form>
                    </div>
                ))}
                {!reviews?.length && <div className="text-center py-16 border-2 border-dashed rounded-xl text-slate-400">No reviews yet</div>}
            </div>
        </div>
    )
}
