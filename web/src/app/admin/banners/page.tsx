import { redirect } from 'next/navigation'
import { requireAdmin } from '../auth-utils'
import { adminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export const revalidate = 0

async function addBanner(formData: FormData) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('banners').insert([{
        title: formData.get('title') as string,
        subtitle: formData.get('subtitle') as string,
        image_url: formData.get('image_url') as string,
        link_url: formData.get('link_url') as string,
        display_order: parseInt(formData.get('display_order') as string) || 0,
        is_active: true,
    }])
    revalidatePath('/admin/banners')
    revalidatePath('/')
}

async function toggleBanner(id: string, active: boolean) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('banners').update({ is_active: active }).eq('id', id)
    revalidatePath('/admin/banners')
    revalidatePath('/')
}

async function deleteBanner(id: string) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('banners').delete().eq('id', id)
    revalidatePath('/admin/banners')
    revalidatePath('/')
}

export default async function AdminBannersPage() {
    await requireAdmin()

    const supabase = adminSupabase()
    const { data: banners } = await supabase.from('banners').select('*').order('display_order')

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Banners</h1>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-6 mb-8">
                <h2 className="font-bold text-lg mb-5">Add New Banner</h2>
                <form action={addBanner} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-slate-500 mb-1">Title *</label>
                            <input name="title" required className="w-full border rounded-lg px-3 py-2 bg-slate-50" placeholder="Summer Sale" /></div>
                        <div><label className="block text-xs font-semibold text-slate-500 mb-1">Subtitle</label>
                            <input name="subtitle" className="w-full border rounded-lg px-3 py-2 bg-slate-50" placeholder="Up to 30% off" /></div>
                    </div>
                    <div><label className="block text-xs font-semibold text-slate-500 mb-1">Image URL *</label>
                        <input name="image_url" required className="w-full border rounded-lg px-3 py-2 bg-slate-50" placeholder="https://..." /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-slate-500 mb-1">Link URL</label>
                            <input name="link_url" className="w-full border rounded-lg px-3 py-2 bg-slate-50" placeholder="/products" /></div>
                        <div><label className="block text-xs font-semibold text-slate-500 mb-1">Order</label>
                            <input name="display_order" type="number" defaultValue="0" className="w-full border rounded-lg px-3 py-2 bg-slate-50" /></div>
                    </div>
                    <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg">+ Add Banner</button>
                </form>
            </div>

            <div className="space-y-3">
                {banners?.map((b: any) => (
                    <div key={b.id} className="bg-white border rounded-xl shadow-sm p-4 flex gap-4 items-center">
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">{b.title}</p>
                            <p className="text-xs text-slate-400">{b.subtitle}</p>
                            <p className="text-xs text-blue-500 mt-0.5">{b.link_url}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{b.is_active ? 'Active' : 'Hidden'}</span>
                            <form action={toggleBanner.bind(null, b.id, !b.is_active)}>
                                <button type="submit" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">{b.is_active ? 'Hide' : 'Show'}</button>
                            </form>
                            <form action={deleteBanner.bind(null, b.id)}>
                                <button type="submit" className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg">Delete</button>
                            </form>
                        </div>
                    </div>
                ))}
                {!banners?.length && <div className="text-center py-10 border-2 border-dashed rounded-xl text-slate-400">No banners</div>}
            </div>
        </div>
    )
}
