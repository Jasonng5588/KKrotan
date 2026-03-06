'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Banner {
    id: string
    title: string
    subtitle: string | null
    image_url: string
    link_url: string | null
    is_active: boolean
    display_order: number
}

export function BannerForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await fetch('/admin/api/banners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: formData.get('title'),
                subtitle: formData.get('subtitle'),
                image_url: formData.get('image_url'),
                link_url: formData.get('link_url'),
                is_active: true,
                display_order: 0,
            })
        })
        if (!res.ok) { setError('Failed to save banner'); } else { onSuccess() }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-card border rounded-xl shadow-sm mb-8">
            <h3 className="font-bold text-lg">Add New Banner</h3>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Title *</Label><Input name="title" required placeholder="Summer Sale" /></div>
                <div className="space-y-1"><Label>Subtitle</Label><Input name="subtitle" placeholder="Up to 40% off" /></div>
            </div>
            <div className="space-y-1"><Label>Image URL *</Label><Input name="image_url" required placeholder="https://... or /images/banner.jpg" /></div>
            <div className="space-y-1"><Label>Link URL</Label><Input name="link_url" placeholder="/products?sale=true" /></div>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Banner'}</Button>
        </form>
    )
}
