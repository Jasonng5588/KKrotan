import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })

    const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, profiles(email, first_name, last_name)')
        .order('created_at', { ascending: false })

    if (!orders) return new NextResponse('No data', { status: 404 })

    const csvRows: string[] = []
    const headers = ['Order ID', 'Date', 'Customer Email', 'Customer Name', 'Total Amount', 'Status']
    csvRows.push(headers.join(','))

    for (const order of orders) {
        const p = order.profiles as unknown as { email?: string; first_name?: string; last_name?: string } | null
        const row = [
            order.id,
            new Date(order.created_at).toISOString(),
            p?.email || '',
            `"${p?.first_name || ''} ${p?.last_name || ''}"`,
            order.total_amount,
            order.status
        ]
        csvRows.push(row.join(','))
    }

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="orders_${new Date().toISOString().split('T')[0]}.csv"`
        }
    })
}
