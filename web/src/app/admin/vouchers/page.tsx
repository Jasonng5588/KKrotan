import { redirect } from 'next/navigation'
import { requireAdmin } from '../auth-utils'
import { adminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export const revalidate = 0

async function addVoucher(formData: FormData) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('vouchers').insert([{
        code: (formData.get('code') as string).toUpperCase().trim(),
        discount_type: formData.get('discount_type') as string,
        discount_value: parseFloat(formData.get('discount_value') as string),
        min_order_amount: formData.get('min_order_amount') ? parseFloat(formData.get('min_order_amount') as string) : null,
        max_uses: formData.get('max_uses') ? parseInt(formData.get('max_uses') as string) : null,
        expires_at: formData.get('expires_at') || null,
        is_active: true,
    }])
    revalidatePath('/admin/vouchers')
}

async function toggleVoucher(id: string, active: boolean) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('vouchers').update({ is_active: active }).eq('id', id)
    revalidatePath('/admin/vouchers')
}

async function deleteVoucher(id: string) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('vouchers').delete().eq('id', id)
    revalidatePath('/admin/vouchers')
}

export default async function AdminVouchersPage() {
    await requireAdmin()

    const supabase = adminSupabase()
    const { data: vouchers } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false })

    return (
        <div>
            <div className="mb-8"><h1 className="text-3xl font-bold text-slate-800">Vouchers</h1></div>

            <div className="bg-white border rounded-xl shadow-sm p-6 mb-8">
                <h2 className="font-bold text-lg mb-5">Create Voucher</h2>
                <form action={addVoucher} className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div><label className="block text-xs font-semibold text-slate-500 mb-1">Code *</label>
                            <input name="code" required className="w-full border rounded-lg px-3 py-2 bg-slate-50 uppercase" placeholder="SALE20" /></div>
                        <div><label className="block text-xs font-semibold text-slate-500 mb-1">Type *</label>
                            <select name="discount_type" className="w-full border rounded-lg px-3 py-2 bg-slate-50">
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed (RM)</option>
                            </select></div>
                        <div><label className="block text-xs font-semibold text-slate-500 mb-1">Value *</label>
                            <input name="discount_value" type="number" step="0.01" min="0" required className="w-full border rounded-lg px-3 py-2 bg-slate-50" placeholder="20" /></div>
                        <div><label className="block text-xs font-semibold text-slate-500 mb-1">Min Order (RM)</label>
                            <input name="min_order_amount" type="number" step="0.01" min="0" className="w-full border rounded-lg px-3 py-2 bg-slate-50" placeholder="100" /></div>
                        <div><label className="block text-xs font-semibold text-slate-500 mb-1">Max Uses</label>
                            <input name="max_uses" type="number" min="1" className="w-full border rounded-lg px-3 py-2 bg-slate-50" placeholder="100" /></div>
                        <div><label className="block text-xs font-semibold text-slate-500 mb-1">Expires At</label>
                            <input name="expires_at" type="datetime-local" className="w-full border rounded-lg px-3 py-2 bg-slate-50" /></div>
                    </div>
                    <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg">+ Create Voucher</button>
                </form>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">Code</th>
                            <th className="px-4 py-3 text-left">Discount</th>
                            <th className="px-4 py-3 text-left">Min Order</th>
                            <th className="px-4 py-3 text-left">Uses</th>
                            <th className="px-4 py-3 text-left">Expires</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {vouchers?.map((v: any) => (
                            <tr key={v.id}>
                                <td className="px-4 py-3 font-mono font-bold text-amber-700">{v.code}</td>
                                <td className="px-4 py-3">{v.discount_type === 'percentage' ? `${v.discount_value}%` : `RM${v.discount_value}`}</td>
                                <td className="px-4 py-3">{v.min_order_amount ? `RM${v.min_order_amount}` : '—'}</td>
                                <td className="px-4 py-3">{v.used_count || 0}{v.max_uses ? `/${v.max_uses}` : ''}</td>
                                <td className="px-4 py-3">{v.expires_at ? new Date(v.expires_at).toLocaleDateString() : '—'}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{v.is_active ? 'Active' : 'Inactive'}</span></td>
                                <td className="px-4 py-3 text-right flex gap-2 justify-end">
                                    <form action={toggleVoucher.bind(null, v.id, !v.is_active)}>
                                        <button type="submit" className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">{v.is_active ? 'Disable' : 'Enable'}</button>
                                    </form>
                                    <form action={deleteVoucher.bind(null, v.id)}>
                                        <button type="submit" className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg">Delete</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {!vouchers?.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No vouchers</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
