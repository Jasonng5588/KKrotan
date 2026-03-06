import { redirect } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ClientProductEditForm } from './ClientProductEditForm'

export const revalidate = 0

async function createProduct(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const supabase = adminSupabase()
    const { data: product } = await supabase.from('products').insert([{
        name,
        slug,
        category_id: formData.get('category_id') || null,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        stock: parseInt(formData.get('stock') as string) || 0,
        is_active: true,
    }]).select('id').single()

    if (product && formData.get('image_url')) {
        await supabase.from('product_images').insert([{
            product_id: product.id,
            image_url: formData.get('image_url') as string,
            is_primary: true,
        }])
    }
    revalidatePath('/admin/products')
    revalidatePath('/products')
}

async function updateProduct(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabase = adminSupabase()
    await supabase.from('products').update({
        name: formData.get('name') as string,
        category_id: formData.get('category_id') || null,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        stock: parseInt(formData.get('stock') as string) || 0,
    }).eq('id', id)

    // Update primary image if provided
    const imageUrl = formData.get('image_url') as string
    if (imageUrl) {
        const { data: existing } = await supabase.from('product_images').select('id').eq('product_id', id).eq('is_primary', true).maybeSingle()
        if (existing) {
            await supabase.from('product_images').update({ image_url: imageUrl }).eq('id', existing.id)
        } else {
            await supabase.from('product_images').insert([{ product_id: id, image_url: imageUrl, is_primary: true }])
        }
    }
    revalidatePath('/admin/products')
    revalidatePath('/products')
}

async function deleteProduct(id: string) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('product_images').delete().eq('product_id', id)
    await supabase.from('products').delete().eq('id', id)
    revalidatePath('/admin/products')
    revalidatePath('/products')
}

async function toggleProduct(id: string, active: boolean) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('products').update({ is_active: active }).eq('id', id)
    revalidatePath('/admin/products')
    revalidatePath('/products')
}

export default async function AdminProductsPage() {

    const { cookies } = require('next/headers')
    const isAdmin = cookies().get('kkrotan_admin_session')?.value === 'kkrotan_admin_authenticated_2026'
    if (!isAdmin) redirect('/admin/login')

    const supabase = adminSupabase()
    const [{ data: products }, { data: categories }] = await Promise.all([
        supabase.from('products').select('*, categories(name, id), product_images(image_url, is_primary)').order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name').order('name'),
    ])

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Products</h1>
                <p className="text-slate-500 mt-1">{products?.length || 0} products</p>
            </div>

            {/* Add Product */}
            <div className="bg-white border rounded-xl shadow-sm p-6 mb-8">
                <h2 className="font-bold text-lg mb-5 text-slate-800">Add New Product</h2>
                <form action={createProduct} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Product Name *</label>
                            <input name="name" required className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="Manau Rattan Pole (3m)" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                            <select name="category_id" className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:bg-white">
                                <option value="">-- No Category --</option>
                                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                        <textarea name="description" rows={2} className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="Product description..." />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Price (RM) *</label>
                            <input name="price" type="number" step="0.01" min="0" required className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="45.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Stock *</label>
                            <input name="stock" type="number" min="0" required defaultValue="0" className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Image URL</label>
                            <input name="image_url" className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" placeholder="https://..." />
                        </div>
                    </div>
                    <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg transition-colors">
                        + Add Product
                    </button>
                </form>
            </div>

            {/* Product List with Inline Edit */}
            <div className="space-y-3">
                {products?.map((p: any) => {
                    const img = p.product_images?.find((i: any) => i.is_primary) || p.product_images?.[0]
                    return (
                        <details key={p.id} className="bg-white border rounded-xl shadow-sm group">
                            <summary className="flex items-center gap-4 p-4 cursor-pointer list-none hover:bg-slate-50 rounded-xl">
                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border flex-shrink-0">
                                    {img ? <img src={img.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🪑</div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{p.name}</p>
                                    <p className="text-xs text-slate-400">{p.categories?.name || 'No category'} · {p.slug}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-amber-700">RM{p.price.toFixed(2)}</p>
                                    <p className={`text-xs font-semibold ${p.stock < 5 ? 'text-red-600' : 'text-green-600'}`}>Stock: {p.stock}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {p.is_active ? 'Active' : 'Hidden'}
                                </span>
                                <span className="text-slate-400 text-sm">▼</span>
                            </summary>

                            <div className="border-t p-5">
                                <h3 className="font-semibold text-sm text-slate-700 mb-4">Edit Product</h3>

                                <ClientProductEditForm product={{ ...p, image_url: img?.image_url }} categories={categories || []} updateAction={updateProduct} />

                                {/* Action Buttons (Outside form) */}
                                <div className="flex gap-3 mt-4 pt-4 border-t">
                                    <form action={toggleProduct.bind(null, p.id, !p.is_active)}>
                                        <button type="submit" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
                                            {p.is_active ? 'Hide' : 'Show'}
                                        </button>
                                    </form>
                                    <form action={deleteProduct.bind(null, p.id)}>
                                        <button type="submit" className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold rounded-lg transition-colors">
                                            Delete
                                        </button>
                                    </form>
                                    <Link href={`/products/${p.slug}`} target="_blank">
                                        <button type="button" className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold rounded-lg transition-colors">
                                            View Live
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </details>
                    )
                })}
                {!products?.length && (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl text-slate-400">No products yet. Add one above.</div>
                )}
            </div>
        </div>
    )
}
