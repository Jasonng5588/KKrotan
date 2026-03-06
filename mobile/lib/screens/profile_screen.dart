import 'package:flutter/material.dart';
import '../main.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? profile;
  bool loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final user = supabase.auth.currentUser;
    if (user == null) { setState(() => loading = false); return; }
    final p = await supabase.from('profiles').select().eq('id', user.id).maybeSingle();
    if (mounted) setState(() { profile = p; loading = false; });
  }

  Future<void> _logout() async {
    await supabase.auth.signOut();
  }

  @override
  Widget build(BuildContext context) {
    final user = supabase.auth.currentUser;
    if (user == null) return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: const Center(child: Text('Please login to view profile')),
    );

    final name = '${profile?['first_name'] ?? ''} ${profile?['last_name'] ?? ''}'.trim();
    final initials = name.isNotEmpty ? name.split(' ').map((n) => n.isNotEmpty ? n[0] : '').join('').substring(0, name.split(' ').length > 1 ? 2 : 1).toUpperCase() : '?';

    return Scaffold(
      backgroundColor: const Color(0xFFF9F4EF),
      appBar: AppBar(title: const Text('My Profile'), actions: [
        IconButton(icon: const Icon(Icons.logout), onPressed: _logout, tooltip: 'Logout'),
      ]),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  // Avatar
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: const Color(0xFF8B5E3C),
                    child: Text(initials, style: const TextStyle(fontSize: 32, color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 16),
                  Text(name.isNotEmpty ? name : 'No name set', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  Text(user.email ?? '', style: const TextStyle(color: Colors.grey)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: profile?['role'] == 'admin' ? Colors.purple[100] : Colors.blue[100],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      (profile?['role'] ?? 'customer').toString().toUpperCase(),
                      style: TextStyle(
                        color: profile?['role'] == 'admin' ? Colors.purple[800] : Colors.blue[800],
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Menu Items
                  _menuItem(Icons.receipt_long, 'My Orders', () {}, context),
                  _menuItem(Icons.favorite_outline, 'My Wishlist', () {}, context),
                  _menuItem(Icons.location_on_outlined, 'Addresses', () {}, context),
                  _menuItem(Icons.business, 'B2B Quotes', () {}, context),
                  _menuItem(Icons.support_agent, 'Contact Support', () {}, context),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _logout,
                      icon: const Icon(Icons.logout, color: Colors.red),
                      label: const Text('Sign Out', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        side: const BorderSide(color: Colors.red),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _menuItem(IconData icon, String label, VoidCallback onTap, BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF8B5E3C)),
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
        onTap: onTap,
      ),
    );
  }
}
