"use client"
import { useState } from 'react'

export function ClientCustomerEditForm({ customer, updateAction }: { customer: any, updateAction: any }) {
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
            <input type="hidden" name="id" value={customer.id} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">First Name</label>
                    <input name="first_name" defaultValue={customer.first_name || ''} className="w-full border text-sm rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Last Name</label>
                    <input name="last_name" defaultValue={customer.last_name || ''} className="w-full border text-sm rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                    <input name="phone" defaultValue={customer.phone || ''} className="w-full border text-sm rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" />
                </div>
            </div>

            {success && (
                <div className="p-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                    ✅ Customer details updated successfully!
                </div>
            )}

            <div className="pt-2">
                <button type="submit" disabled={loading} className="px-5 py-2 bg-slate-800 disabled:bg-slate-500 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    {loading ? 'Saving...' : 'Save Customer Details'}
                </button>
            </div>
        </form>
    )
}
