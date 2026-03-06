import { redirect } from 'next/navigation'
import { requireAdmin } from '../auth-utils'
import { adminSupabase } from '@/lib/supabase/admin'

export const revalidate = 0

export default async function AdminUsersPage() {
    await requireAdmin()

    const supabase = adminSupabase()
    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-slate-800">Manage Users</h1>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">User ID</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Role</th>
                            <th className="px-4 py-3 text-left">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users?.map((user: any) => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-mono text-xs text-slate-400">{user.id.split('-')[0]}</td>
                                <td className="px-4 py-3 font-medium">{user.first_name} {user.last_name}</td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
