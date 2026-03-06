import { adminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { ClientCustomerEditForm } from './ClientCustomerEditForm'

export const revalidate = 0

async function updateCustomer(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabase = adminSupabase()
    await supabase.from('profiles').update({
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        phone: formData.get('phone') as string,
    }).eq('id', id)

    revalidatePath('/admin/customers')
}

async function toggleAdminRole(id: string, newRole: string) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('profiles').update({ role: newRole }).eq('id', id)
    revalidatePath('/admin/customers')
}

export default async function AdminCustomersPage() {
    const supabase = adminSupabase()

    const { data: customers } = await supabase
        .from('profiles')
        .select(`
            *,
            orders (count)
        `)
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Customers</h1>
                    <p className="text-slate-500 mt-1">{customers?.length || 0} registered users</p>
                </div>
            </div>

            <div className="space-y-3">
                {customers?.map((c: any) => (
                    <details key={c.id} className="bg-white border rounded-xl shadow-sm group">
                        <summary className="flex items-center gap-4 p-4 cursor-pointer list-none hover:bg-slate-50 rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm flex-shrink-0">
                                {c.first_name?.[0] || c.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-800 truncate">
                                    {c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}` : 'Unnamed User'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{c.email}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-semibold text-slate-700">{c.orders?.[0]?.count || 0} Orders</p>
                                <p className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                {c.role === 'admin' ? 'Admin' : 'Customer'}
                            </span>
                            <span className="text-slate-400 text-sm opacity-50 transition-transform group-open:rotate-180">▼</span>
                        </summary>

                        {/* Expanded Details / Edit Form */}
                        <div className="border-t p-5 bg-slate-50/50">
                            <h3 className="font-semibold text-sm text-slate-700 mb-4">Edit Customer Profile</h3>

                            <ClientCustomerEditForm customer={c} updateAction={updateCustomer} />

                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <h4 className="font-semibold text-sm text-slate-700 mb-3">Admin Actions</h4>
                                <div className="flex gap-3">
                                    <form action={toggleAdminRole.bind(null, c.id, c.role === 'admin' ? 'user' : 'admin')}>
                                        <button type="submit" className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${c.role === 'admin' ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' : 'bg-purple-100 hover:bg-purple-200 text-purple-700'}`}>
                                            {c.role === 'admin' ? 'Remove Admin Privileges' : 'Make Administrator'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </details>
                ))}

                {!customers?.length && (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl text-slate-400">
                        No customers found.
                    </div>
                )}
            </div>
        </div>
    )
}
