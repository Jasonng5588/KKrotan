'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileEditFormProps {
    profile: {
        id: string
        first_name?: string
        last_name?: string
        phone?: string
        email: string
    }
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
    const router = useRouter()
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
    })

    async function handleSave() {
        setLoading(true)
        setError('')
        const supabase = createClient()
        const { error: err } = await supabase
            .from('profiles')
            .update({
                first_name: form.first_name,
                last_name: form.last_name,
                phone: form.phone,
            })
            .eq('id', profile.id)

        setLoading(false)
        if (err) { setError(err.message); return }
        setSuccess(true)
        setEditing(false)
        setTimeout(() => setSuccess(false), 3000)
        router.refresh()
    }

    return (
        <div className="bg-card border rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-lg">Profile Information</h2>
                {!editing ? (
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>✏️ Edit</Button>
                ) : (
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
            </div>

            {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">
                    ✅ Profile updated successfully!
                </div>
            )}
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>First Name</Label>
                    {editing ? (
                        <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="First name" />
                    ) : (
                        <p className="text-sm font-medium py-2">{form.first_name || <span className="text-muted-foreground">—</span>}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label>Last Name</Label>
                    {editing ? (
                        <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Last name" />
                    ) : (
                        <p className="text-sm font-medium py-2">{form.last_name || <span className="text-muted-foreground">—</span>}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label>Phone</Label>
                    {editing ? (
                        <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+60 12-345 6789" />
                    ) : (
                        <p className="text-sm font-medium py-2">{form.phone || <span className="text-muted-foreground">—</span>}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label>Email</Label>
                    <p className="text-sm font-medium py-2 text-muted-foreground">{profile.email}</p>
                </div>
            </div>
        </div>
    )
}
