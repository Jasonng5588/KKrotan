'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (password !== confirm) { setError('Passwords do not match.'); return }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
        setLoading(true)
        setError('')
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({ password })
        if (error) { setError(error.message) } else { setSuccess(true) }
        setLoading(false)
    }

    if (success) return (
        <div className="flex-1 flex items-center justify-center py-20 px-4">
            <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow border text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold mb-2">Password Updated!</h2>
                <p className="text-muted-foreground mb-6">Your password has been changed successfully.</p>
                <Button onClick={() => router.push('/login')} className="w-full">Back to Login</Button>
            </div>
        </div>
    )

    return (
        <div className="flex-1 flex items-center justify-center py-20 px-4 bg-muted/30">
            <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow border">
                <h1 className="text-2xl font-bold text-center mb-6">Set New Password</h1>
                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="h-12" placeholder="Min. 6 characters" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm">Confirm Password</Label>
                        <Input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="h-12" placeholder="Same as above" />
                    </div>
                    <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
