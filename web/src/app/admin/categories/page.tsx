import { redirect } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export const revalidate = 0

async function addCategory(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const supabase = adminSupabase()
    await supabase.from('categories').insert([{ name, slug, is_active: true }])
    revalidatePath('/admin/categories')
    revalidatePath('/products')
}

async function toggleCategory(id: string, active: boolean) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('categories').update({ is_active: active }).eq('id', id)
    revalidatePath('/admin/categories')
    revalidatePath('/products')
}

async function deleteCategory(id: string) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('categories').delete().eq('id', id)
    revalidatePath('/admin/categories')
    revalidatePath('/products')
}

export default async function AdminCategoriesPage() {

    const { cookies } = require('next/headers')
    const isAdmin = cookies().get('kkrotan_admin_session')?.value === 'kkrotan_admin_authenticated_2026'
    if (!isAdmin) redirect('/admin/login')

    const supabase = adminSupabase()
    const { data: categories } = await supabase
        .from('categories')
        .select('*, products(count)')
        .order('name')

    return (
        <div>
            <div className="mb-8"><h1 className="text-3xl font-bold text-slate-800">Categories</h1></div>

            <div className="bg-white border rounded-xl shadow-sm p-6 mb-8">
                <h2 className="font-bold text-lg mb-5 text-slate-800">Add Category</h2>
                <form action={addCategory} className="flex gap-3">
                    <input name="name" required className="flex-1 border rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="Category name (slug auto-generated)" />
                    <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg whitespace-nowrap">+ Add</button>
                </form>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Slug</th>
                            <th className="px-4 py-3 text-left">Products</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {categories?.map((c: any) => (
                            <tr key={c.id}>
                                <td className="px-4 py-3 font-semibold">{c.name}</td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.slug}</td>
                                <td className="px-4 py-3 text-slate-600">{c.products?.[0]?.count || 0}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${c.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{c.is_active !== false ? 'Active' : 'Hidden'}</span></td>
                                <td className="px-4 py-3 text-right flex gap-2 justify-end">
                                    <form action={toggleCategory.bind(null, c.id, !c.is_active)}>
                                        <button type="submit" className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">{c.is_active !== false ? 'Hide' : 'Show'}</button>
                                    </form>
                                    <form action={deleteCategory.bind(null, c.id)}>
                                        <button type="submit" className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg">Delete</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {!categories?.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No categories</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
