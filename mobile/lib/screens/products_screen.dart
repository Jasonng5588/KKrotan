import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../main.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});
  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  List<Map<String, dynamic>> products = [];
  bool loading = true;
  String search = '';

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final q = supabase.from('products').select('*, categories(name), product_images(image_url, is_primary)').eq('is_active', true);
    final res = await q;
    if (mounted) setState(() { products = List<Map<String, dynamic>>.from(res); loading = false; });
  }

  List<Map<String, dynamic>> get filtered => search.isEmpty
      ? products
      : products.where((p) => (p['name'] as String).toLowerCase().contains(search.toLowerCase())).toList();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9F4EF),
      appBar: AppBar(
        title: const Text('Products'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: TextField(
              onChanged: (v) => setState(() => search = v),
              decoration: InputDecoration(
                hintText: 'Search products...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),
        ),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : filtered.isEmpty
              ? const Center(child: Text('No products found', style: TextStyle(color: Colors.grey)))
              : Padding(
                  padding: const EdgeInsets.all(12),
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2, childAspectRatio: 0.7, crossAxisSpacing: 12, mainAxisSpacing: 12,
                    ),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, i) {
                      final p = filtered[i];
                      final images = p['product_images'] as List? ?? [];
                      final imgUrl = images.isNotEmpty ? images.firstWhere((img) => img['is_primary'] == true, orElse: () => images[0])['image_url'] as String? : null;
                      return _ProductCard(product: p, imageUrl: imgUrl);
                    },
                  ),
                ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  final String? imageUrl;
  const _ProductCard({required this.product, this.imageUrl});

  Future<void> _addToCart(BuildContext ctx) async {
    final user = supabase.auth.currentUser;
    if (user == null) {
      ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Please login to add to cart')));
      return;
    }
    try {
      // Ensure profile exists
      await supabase.from('profiles').upsert({'id': user.id, 'email': user.email ?? '', 'role': 'customer'}, onConflict: 'id');
      // Get or create cart
      var cartRes = await supabase.from('carts').select('id').eq('profile_id', user.id).maybeSingle();
      String cartId;
      if (cartRes == null) {
        final newCart = await supabase.from('carts').insert({'profile_id': user.id}).select('id').single();
        cartId = newCart['id'];
      } else {
        cartId = cartRes['id'];
      }
      // Check existing
      final existing = await supabase.from('cart_items').select('id, quantity').eq('cart_id', cartId).eq('product_id', product['id']).maybeSingle();
      if (existing != null) {
        await supabase.from('cart_items').update({'quantity': existing['quantity'] + 1}).eq('id', existing['id']);
      } else {
        await supabase.from('cart_items').insert({'cart_id': cartId, 'product_id': product['id'], 'quantity': 1});
      }
      ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('✅ Added to cart!'), backgroundColor: Colors.green));
    } catch (e) {
      ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: imageUrl != null
                ? Image.network(imageUrl!, fit: BoxFit.cover, width: double.infinity, errorBuilder: (_, __, ___) => _ph())
                : _ph(),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12), maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Text('RM${(product['price'] as num).toStringAsFixed(2)}', style: const TextStyle(color: Color(0xFF8B5E3C), fontWeight: FontWeight.w800, fontSize: 14)),
                const SizedBox(height: 6),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => _addToCart(context),
                    style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 6), textStyle: const TextStyle(fontSize: 11)),
                    child: const Text('Add to Cart'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  Widget _ph() => Container(color: const Color(0xFFE8D5C4), child: const Center(child: Text('🪑', style: TextStyle(fontSize: 36))));
}
