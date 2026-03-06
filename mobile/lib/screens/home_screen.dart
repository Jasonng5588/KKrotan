import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../main.dart';
import 'products_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Map<String, dynamic>> featuredProducts = [];
  List<Map<String, dynamic>> categories = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final prods = await supabase
        .from('products')
        .select('*, product_images(image_url, is_primary)')
        .eq('is_active', true)
        .order('created_at', ascending: false)
        .limit(6);
    final cats = await supabase.from('categories').select().eq('is_active', true);
    if (mounted) setState(() { featuredProducts = List<Map<String, dynamic>>.from(prods); categories = List<Map<String, dynamic>>.from(cats); loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9F4EF),
      body: CustomScrollView(
        slivers: [
          // Hero App Bar
          SliverAppBar(
            expandedHeight: 200,
            floating: false,
            pinned: true,
            backgroundColor: const Color(0xFF8B5E3C),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF8B5E3C), Color(0xFFB8835A)],
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 80, 20, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      const Text('🌿 KK Rotan', style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w600, letterSpacing: 2)),
                      const SizedBox(height: 4),
                      const Text('Premium Rattan', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
                      const Text("Malaysia's Finest Quality", style: TextStyle(color: Colors.white70, fontSize: 14)),
                    ],
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: loading
                ? const Padding(padding: EdgeInsets.all(80), child: Center(child: CircularProgressIndicator()))
                : Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Featured products
                        const Text('Featured Products', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF3D2B1F))),
                        const SizedBox(height: 12),
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.75,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: featuredProducts.length,
                          itemBuilder: (ctx, i) {
                            final p = featuredProducts[i];
                            final images = p['product_images'] as List? ?? [];
                            final imgUrl = images.isNotEmpty ? images[0]['image_url'] as String? : null;
                            return _ProductCard(product: p, imageUrl: imgUrl);
                          },
                        ),
                        const SizedBox(height: 24),

                        // Categories
                        const Text('Shop by Category', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF3D2B1F))),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: categories.map((cat) {
                            return GestureDetector(
                              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProductsScreen())),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF8B5E3C).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(50),
                                  border: Border.all(color: const Color(0xFF8B5E3C).withOpacity(0.3)),
                                ),
                                child: Text(cat['name'] as String, style: const TextStyle(color: Color(0xFF8B5E3C), fontWeight: FontWeight.w600)),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  final String? imageUrl;
  const _ProductCard({required this.product, this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {},
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: imageUrl != null
                  ? Image.network(imageUrl!, fit: BoxFit.cover, width: double.infinity, errorBuilder: (_, __, ___) => _placeholder())
                  : _placeholder(),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13), maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Text('RM${(product['price'] as num).toStringAsFixed(2)}',
                      style: const TextStyle(color: Color(0xFF8B5E3C), fontWeight: FontWeight.w800, fontSize: 15)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholder() => Container(
    color: const Color(0xFFE8D5C4),
    width: double.infinity,
    height: double.infinity,
    child: const Center(child: Text('🪑', style: TextStyle(fontSize: 40))),
  );
}
