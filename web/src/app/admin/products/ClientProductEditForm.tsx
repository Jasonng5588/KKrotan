"use client"
import { useState } from 'react'

export function ClientProductEditForm({ product, categories, updateAction }: { product: any, categories: any[], updateAction: any }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    return (
        <form
            action={async (formData) => {
                setLoading(true)
                try {
                    await updateAction(formData)
                    setSuccess(true)
                    setTimeout(() => setSuccess(false), 3000)
                } finally {
                    setLoading(false)
                }
            }}
            className="space-y-4"
        >
            <input type="hidden" name="id" value={product.id} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
                    <input name="name" defaultValue={product.name} className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                    <select name="category_id" defaultValue={product.category_id || ''} className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white">
                        <option value="">-- No Category --</option>
                        {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                <textarea name="description" rows={2} defaultValue={product.description || ''} className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white" />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Price (RM)</label>
                    <input name="price" type="number" step="0.01" defaultValue={product.price} className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Stock</label>
                    <input name="stock" type="number" defaultValue={product.stock} className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Image URL</label>
                    <input name="image_url" defaultValue={product.image_url || ''} className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white" />
                </div>
            </div>

            {success && (
                <div className="p-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                    ✅ Changes saved successfully!
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors">
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    )
}
