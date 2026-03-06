'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitQuote } from './actions'

export default function B2BPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const formData = new FormData(e.currentTarget)
        const res = await submitQuote(formData)
        setLoading(false)
        if (res?.error) {
            setError(res.error)
        } else {
            setSuccess(true)
        }
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl">
            {/* Success Popup */}
            {success && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSuccess(false)}>
                    <div className="bg-card rounded-2xl shadow-xl p-10 max-w-md w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold mb-2">Quote Submitted!</h2>
                        <p className="text-muted-foreground mb-6">
                            Thank you for your wholesale inquiry. Our team will review your request and contact you within 1-2 business days.
                        </p>
                        <Button onClick={() => setSuccess(false)} className="w-full">Close</Button>
                    </div>
                </div>
            )}

            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold mb-3 text-foreground">Wholesale / B2B Quote</h1>
                <p className="text-muted-foreground text-lg">Request special bulk pricing or custom orders for your business needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                    { icon: '🏷', title: 'Bulk Pricing', desc: 'Special rates from 10+ units' },
                    { icon: '🤝', title: 'Dedicated Account', desc: 'Assigned sales representative' },
                    { icon: '🚚', title: 'Priority Shipping', desc: 'Faster delivery for B2B orders' },
                ].map(f => (
                    <div key={f.title} className="text-center p-5 bg-card border rounded-xl shadow-sm">
                        <div className="text-3xl mb-2">{f.icon}</div>
                        <p className="font-bold text-sm mb-1">{f.title}</p>
                        <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                ))}
            </div>

            <div className="bg-card border rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold mb-6">Submit Your Request</h2>
                {error && (
                    <div className="mb-5 p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="company_name">Company Name (Optional)</Label>
                        <Input id="company_name" name="company_name" placeholder="KK Trading Sdn Bhd" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" name="phone" required placeholder="+60 12-345 6789" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="message">Requirements & Order Details *</Label>
                        <Textarea
                            id="message"
                            name="message"
                            required
                            placeholder="Please describe the products you need, quantity, and any special requirements..."
                            className="min-h-[150px]"
                        />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                        {loading ? 'Submitting...' : 'Request Quote'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">You must be logged in to submit a quote.</p>
                </form>
            </div>
        </div>
    )
}
