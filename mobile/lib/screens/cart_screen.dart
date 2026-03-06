import 'package:flutter/material.dart';
import '../main.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});
  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<Map<String, dynamic>> cartItems = [];
  bool loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final user = supabase.auth.currentUser;
    if (user == null) { setState(() => loading = false); return; }

    final cart = await supabase.from('carts').select('id').eq('profile_id', user.id).maybeSingle();
    if (cart == null) { setState(() => loading = false); return; }

    final items = await supabase
        .from('cart_items')
        .select('*, products(id, name, price, product_images(image_url, is_primary))')
        .eq('cart_id', cart['id']);
    if (mounted) setState(() { cartItems = List<Map<String, dynamic>>.from(items); loading = false; });
  }

  Future<void> _remove(String itemId) async {
    await supabase.from('cart_items').delete().eq('id', itemId);
    _load();
  }

  Future<void> _checkout() async {
    final user = supabase.auth.currentUser;
    if (user == null || cartItems.isEmpty) return;
    final total = cartItems.fold<double>(0, (acc, item) {
      final price = (item['products']['price'] as num).toDouble();
      final qty = item['quantity'] as int;
      return acc + price * qty;
    });
    try {
      await supabase.from('profiles').upsert({'id': user.id, 'email': user.email ?? '', 'role': 'customer'});
      final order = await supabase.from('orders').insert({'profile_id': user.id, 'total_amount': total, 'status': 'pending'}).select('id').single();
      for (final item in cartItems) {
        await supabase.from('order_items').insert({
          'order_id': order['id'], 'product_id': item['products']['id'],
          'quantity': item['quantity'], 'price': item['products']['price'],
        });
      }
      // Clear cart
      final cart = await supabase.from('carts').select('id').eq('profile_id', user.id).maybeSingle();
      if (cart != null) await supabase.from('cart_items').delete().eq('cart_id', cart['id']);
      if (mounted) {
        setState(() => cartItems = []);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Order placed successfully!'), backgroundColor: Colors.green));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = supabase.auth.currentUser;
    if (user == null) return Scaffold(
      appBar: AppBar(title: const Text('Cart')),
      body: const Center(child: Text('Please login to view your cart')),
    );

    final total = cartItems.fold<double>(0, (acc, item) {
      final price = (item['products']['price'] as num).toDouble();
      return acc + price * (item['quantity'] as int);
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF9F4EF),
      appBar: AppBar(title: const Text('Shopping Cart')),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : cartItems.isEmpty
              ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                  const Text('🛒', style: TextStyle(fontSize: 64)),
                  const SizedBox(height: 16),
                  const Text('Your cart is empty', style: TextStyle(fontSize: 18, color: Colors.grey)),
                ]))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: cartItems.length,
                  itemBuilder: (ctx, i) {
                    final item = cartItems[i];
                    final p = item['products'];
                    final images = p['product_images'] as List? ?? [];
                    final imgUrl = images.isNotEmpty ? images[0]['image_url'] as String? : null;
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: imgUrl != null
                                ? Image.network(imgUrl, width: 70, height: 70, fit: BoxFit.cover)
                                : Container(width: 70, height: 70, color: const Color(0xFFE8D5C4), child: const Center(child: Text('🪑', style: TextStyle(fontSize: 32)))),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(p['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold), maxLines: 2, overflow: TextOverflow.ellipsis),
                            const SizedBox(height: 4),
                            Text('RM${(p['price'] as num).toStringAsFixed(2)} × ${item['quantity']}', style: const TextStyle(color: Color(0xFF8B5E3C), fontWeight: FontWeight.w700)),
                          ])),
                          IconButton(icon: const Icon(Icons.delete_outline, color: Colors.red), onPressed: () => _remove(item['id'])),
                        ]),
                      ),
                    );
                  },
                ),
      bottomNavigationBar: cartItems.isEmpty ? null : SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              const Text('Total:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text('RM${total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF8B5E3C))),
            ]),
            const SizedBox(height: 12),
            SizedBox(width: double.infinity, child: ElevatedButton(
              onPressed: _checkout,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
              child: const Text('Checkout Now', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            )),
          ]),
        ),
      ),
    );
  }
}
