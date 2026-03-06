'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from './actions'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'login' | 'forgot'>('login')
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotSent, setForgotSent] = useState(false)
    const [forgotLoading, setForgotLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const res = await login(formData)
        if (res?.error) {
            setError(res.error)
        }
        setLoading(false)
    }

    async function handleForgotPassword(e: React.FormEvent) {
        e.preventDefault()
        setForgotLoading(true)
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        setForgotLoading(false)
        if (error) {
            setError(error.message)
        } else {
            setForgotSent(true)
        }
    }

    if (mode === 'forgot') {
        return (
            <div className="flex-1 flex items-center justify-center p-4 bg-muted/30 py-20">
                <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow-sm border">
                    <button onClick={() => { setMode('login'); setError(null); setForgotSent(false) }} className="text-primary text-sm hover:underline mb-6 block">← Back to Login</button>
                    <h1 className="text-2xl font-bold text-center mb-2 text-foreground">Reset Password</h1>
                    <p className="text-muted-foreground text-center text-sm mb-6">Enter your email and we'll send you a password reset link.</p>
                    {forgotSent ? (
                        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-5 text-center">
                            <div className="text-4xl mb-3">📧</div>
                            <p className="font-semibold mb-1">Check your email!</p>
                            <p className="text-sm">We've sent a password reset link to <strong>{forgotEmail}</strong>. Check your inbox and spam folder.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                            <div className="space-y-2">
                                <Label htmlFor="forgotEmail">Email address</Label>
                                <Input
                                    id="forgotEmail"
                                    type="email"
                                    value={forgotEmail}
                                    onChange={e => setForgotEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="h-12"
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 font-semibold" disabled={forgotLoading}>
                                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-muted/30 py-20">
            <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow-sm border">
                <h1 className="text-3xl font-bold text-center mb-6 text-foreground">Welcome Back</h1>

                {error && (
                    <div className="mb-5 p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required className="h-12" placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="password">Password</Label>
                            <button type="button" onClick={() => { setMode('forgot'); setError(null) }} className="text-xs text-primary hover:underline font-medium">
                                Forgot password?
                            </button>
                        </div>
                        <Input id="password" name="password" type="password" required className="h-12" placeholder="••••••••" />
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg font-semibold mt-2" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </Button>
                </form>

                <div className="mt-8 text-center text-muted-foreground text-sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline font-semibold">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    )
}
