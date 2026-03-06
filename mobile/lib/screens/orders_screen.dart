import 'package:flutter/material.dart';
import '../main.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});
  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<Map<String, dynamic>> orders = [];
  bool loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final user = supabase.auth.currentUser;
    if (user == null) { setState(() => loading = false); return; }
    final res = await supabase.from('orders').select('*, order_items(quantity, price, products(name))').eq('profile_id', user.id).order('created_at', ascending: false);
    if (mounted) setState(() { orders = List<Map<String, dynamic>>.from(res); loading = false; });
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'pending': return Colors.orange;
      case 'paid': return Colors.blue;
      case 'delivered': return Colors.green;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = supabase.auth.currentUser;
    if (user == null) return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      body: const Center(child: Text('Please login to view orders')),
    );

    return Scaffold(
      backgroundColor: const Color(0xFFF9F4EF),
      appBar: AppBar(title: const Text('My Orders'), actions: [
        IconButton(icon: const Icon(Icons.refresh), onPressed: () { setState(() => loading = true); _load(); }),
      ]),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : orders.isEmpty
              ? const Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Text('📦', style: TextStyle(fontSize: 64)),
                  SizedBox(height: 16),
                  Text('No orders yet', style: TextStyle(fontSize: 18, color: Colors.grey)),
                ]))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: orders.length,
                  itemBuilder: (ctx, i) {
                    final order = orders[i];
                    final items = order['order_items'] as List? ?? [];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                            Text('Order #${(order['id'] as String).substring(0, 8).toUpperCase()}', style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: _statusColor(order['status']).withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                              child: Text(order['status'].toString().toUpperCase(), style: TextStyle(color: _statusColor(order['status']), fontSize: 11, fontWeight: FontWeight.bold)),
                            ),
                          ]),
                          const SizedBox(height: 8),
                          Text(DateTime.parse(order['created_at']).toLocal().toString().substring(0, 16), style: const TextStyle(color: Colors.grey, fontSize: 12)),
                          const Divider(height: 16),
                          ...items.map((item) => Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              Expanded(child: Text(item['products']?['name'] ?? '—', style: const TextStyle(fontSize: 13))),
                              Text('×${item['quantity']}  RM${(item['price'] as num).toStringAsFixed(2)}', style: const TextStyle(fontSize: 13)),
                            ]),
                          )),
                          const Divider(height: 16),
                          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                            const Text('Total', style: TextStyle(fontWeight: FontWeight.bold)),
                            Text('RM${(order['total_amount'] as num).toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF8B5E3C), fontSize: 16)),
                          ]),
                        ]),
                      ),
                    );
                  },
                ),
    );
  }
}
