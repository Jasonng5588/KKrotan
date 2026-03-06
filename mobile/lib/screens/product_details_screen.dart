import 'package:flutter/material.dart';
import '../main.dart';
import 'login_screen.dart';

class ProductDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> product;

  const ProductDetailsScreen({super.key, required this.product});

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  bool _isLoading = false;

  Future<void> _addToCart() async {
    final user = supabase.auth.currentUser;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please log in first')));
      Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
      return;
    }

    setState(() => _isLoading = true);
    try {
      final cartResponse = await supabase.from('carts').select('id').eq('profile_id', user.id).maybeSingle();
      String cartId;
      if (cartResponse == null) {
        final newCart = await supabase.from('carts').insert({'profile_id': user.id}).select('id').single();
        cartId = newCart['id'];
      } else {
        cartId = cartResponse['id'];
      }

      final existingItem = await supabase.from('cart_items').select('id, quantity').eq('cart_id', cartId).eq('product_id', widget.product['id']).maybeSingle();
      if (existingItem != null) {
        await supabase.from('cart_items').update({'quantity': existingItem['quantity'] + 1}).eq('id', existingItem['id']);
      } else {
        await supabase.from('cart_items').insert({'cart_id': cartId, 'product_id': widget.product['id'], 'quantity': 1});
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Added to cart!')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    return Scaffold(
      appBar: AppBar(title: Text(p['name'])),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              height: 300,
              color: Colors.grey[200],
              child: const Icon(Icons.image, size: 100, color: Colors.grey),
            ),
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p['name'], style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text('RM${p['price']}', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)),
                  const SizedBox(height: 16),
                  const Text('Description', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(p['description'] ?? 'No description available.', style: const TextStyle(fontSize: 16)),
                  const SizedBox(height: 24),
                  if (p['stock'] > 0)
                    Text('${p['stock']} items available', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold))
                  else
                    const Text('Out of Stock', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: ElevatedButton(
            onPressed: p['stock'] > 0 && !_isLoading ? _addToCart : null,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              backgroundColor: Theme.of(context).colorScheme.primary,
              foregroundColor: Colors.white,
            ),
            child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('Add to Cart', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
        ),
      ),
    );
  }
}
