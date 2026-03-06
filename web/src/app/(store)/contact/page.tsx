'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitContact } from './actions'

export default function ContactPage() {
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const formData = new FormData(e.currentTarget)

        try {
            await submitContact(formData)
            setSuccess(true)
            e.currentTarget.reset()
        } catch (err: any) {
            setError(err.message || 'Failed to send message.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl">
            {/* Success Popup */}
            {success && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSuccess(false)}>
                    <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold mb-2 text-slate-800">Message Sent!</h2>
                        <p className="text-slate-500 mb-6 font-medium">Thank you for contacting KK Rotan. We will get back to you within 1-2 business days.</p>
                        <Button onClick={() => setSuccess(false)} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">Close</Button>
                    </div>
                </div>
            )}

            <h1 className="text-4xl font-bold mb-4 text-center text-slate-800">Contact Us & B2B Quotes</h1>
            <p className="text-center text-slate-500 mb-10 text-lg">
                Have questions about our products or wholesale pricing? We'd love to hear from you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                    { icon: '📍', label: 'Address', val: 'Kota Kinabalu, Sabah, Malaysia' },
                    { icon: '📞', label: 'Phone', val: '+60 88-XXX XXX' },
                    { icon: '✉️', label: 'Email', val: 'info@kkrotan.com' },
                ].map(c => (
                    <div key={c.label} className="text-center p-5 bg-white border rounded-xl shadow-sm">
                        <div className="text-3xl mb-2">{c.icon}</div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{c.label}</p>
                        <p className="font-medium text-sm text-slate-800">{c.val}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white border rounded-2xl shadow-sm p-8">
                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-semibold">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="firstName" className="text-slate-600">First Name *</Label>
                            <Input id="firstName" name="firstName" placeholder="John" required className="h-11 bg-slate-50" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="lastName" className="text-slate-600">Last Name *</Label>
                            <Input id="lastName" name="lastName" placeholder="Doe" required className="h-11 bg-slate-50" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-slate-600">Email *</Label>
                            <Input id="email" name="email" type="email" placeholder="john@example.com" required className="h-11 bg-slate-50" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-slate-600">Phone Number *</Label>
                            <Input id="phone" name="phone" placeholder="+60 12-345 6789" required className="h-11 bg-slate-50" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="subject" className="text-slate-600">Subject / Company Name *</Label>
                        <Input id="subject" name="subject" placeholder="Wholesale Inquiry / Company Sdn Bhd" required className="h-11 bg-slate-50" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="message" className="text-slate-600">Message *</Label>
                        <Textarea id="message" name="message" placeholder="How can we help you?" className="min-h-[150px] bg-slate-50" required />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base font-semibold bg-slate-800 hover:bg-slate-700 text-white" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
