'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signup } from '../login/actions'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        const res = await signup(formData)
        if (res?.error) {
            setError(res.error)
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-muted/30 py-20">
            <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow-sm border">
                <h1 className="text-3xl font-bold text-center mb-6 text-foreground">Create Account</h1>

                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" name="firstName" required className="h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" name="lastName" required className="h-12" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required className="h-12" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required minLength={6} className="h-12" />
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg font-semibold mt-4">Sign Up</Button>
                </form>

                <div className="mt-8 text-center text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline font-semibold">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    )
}
