'use client'
import { useState } from 'react'
import { adminLogin } from '../auth'

export default function AdminLoginPage() {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const formData = new FormData(e.currentTarget)
        const res = await adminLogin(formData)
        if (res?.error) setError(res.error)
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🌿</div>
                    <h1 className="text-3xl font-bold text-white">KK Rotan Admin</h1>
                    <p className="text-slate-400 mt-2">Sign in to the admin dashboard</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-5 p-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Username</label>
                            <input
                                name="username"
                                type="text"
                                required
                                autoComplete="username"
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="admin username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Signing in...' : 'Sign In to Admin'}
                        </button>
                    </form>
                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <a href="/" className="text-slate-400 text-sm hover:text-white transition-colors">← Back to Store</a>
                    </div>
                </div>
            </div>
        </div>
    )
}
