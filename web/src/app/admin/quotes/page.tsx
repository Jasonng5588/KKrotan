import { adminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export const revalidate = 0

async function updateQuoteStatus(id: string, status: string) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('quotes').update({ status }).eq('id', id)
    revalidatePath('/admin/quotes')
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    responded: 'bg-green-100 text-green-800',
    closed: 'bg-slate-100 text-slate-500',
}

export default async function AdminQuotesPage() {
    const supabase = adminSupabase()
    const { data: quotes } = await supabase
        .from('quotes')
        .select('*, profiles(email, first_name, last_name, phone)')
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">B2B Quote Requests</h1>
                <p className="text-slate-500 mt-1">{quotes?.length || 0} total quotes</p>
            </div>

            <div className="space-y-4">
                {quotes?.map((q: any) => (
                    <div key={q.id} className="bg-white border rounded-xl shadow-sm p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <p className="font-bold text-sm">{q.profiles?.first_name} {q.profiles?.last_name} {q.company_name && <span className="text-slate-500 font-normal">· {q.company_name}</span>}</p>
                                <p className="text-xs text-slate-400">{q.profiles?.email} · {q.phone || q.profiles?.phone}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{new Date(q.created_at).toLocaleString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex-shrink-0 ${statusColors[q.status] || ''}`}>{q.status}</span>
                        </div>
                        <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 mb-4">{q.message}</p>
                        <div className="flex gap-2 flex-wrap">
                            {q.status === 'pending' && (
                                <form action={updateQuoteStatus.bind(null, q.id, 'reviewed')}>
                                    <button type="submit" className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold rounded-lg">Mark Reviewed</button>
                                </form>
                            )}
                            {q.status === 'reviewed' && (
                                <form action={updateQuoteStatus.bind(null, q.id, 'responded')}>
                                    <button type="submit" className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold rounded-lg">Mark Responded</button>
                                </form>
                            )}
                            {q.status !== 'closed' && (
                                <form action={updateQuoteStatus.bind(null, q.id, 'closed')}>
                                    <button type="submit" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg">Close</button>
                                </form>
                            )}
                        </div>
                    </div>
                ))}
                {!quotes?.length && <div className="text-center py-16 border-2 border-dashed rounded-xl text-slate-400">No quote requests yet</div>}
            </div>
        </div>
    )
}
