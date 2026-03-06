import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../main.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtl = TextEditingController();
  final _passCtl = TextEditingController();
  bool _loading = false;
  bool _isSignUp = false;
  final _firstCtl = TextEditingController();
  final _lastCtl = TextEditingController();
  String? _error;

  @override
  void dispose() {
    _emailCtl.dispose(); _passCtl.dispose();
    _firstCtl.dispose(); _lastCtl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      if (_isSignUp) {
        final res = await supabase.auth.signUp(email: _emailCtl.text.trim(), password: _passCtl.text);
        if (res.user != null) {
          await supabase.from('profiles').upsert({'id': res.user!.id, 'email': _emailCtl.text.trim(), 'first_name': _firstCtl.text.trim(), 'last_name': _lastCtl.text.trim(), 'role': 'customer'});
        }
      } else {
        await supabase.auth.signInWithPassword(email: _emailCtl.text.trim(), password: _passCtl.text);
      }
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = e.toString());
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _forgotPassword() async {
    if (_emailCtl.text.isEmpty) {
      setState(() => _error = 'Enter your email address first');
      return;
    }
    await supabase.auth.resetPasswordForEmail(_emailCtl.text.trim());
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password reset email sent! Check your inbox.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF8B5E3C), Color(0xFFB8835A), Color(0xFFE8C99A)]),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const Text('🌿', style: TextStyle(fontSize: 64)),
                  const SizedBox(height: 8),
                  const Text('KK Rotan', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text(_isSignUp ? 'Create Account' : 'Welcome Back', style: const TextStyle(color: Colors.white70, fontSize: 16)),
                  const SizedBox(height: 32),

                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, 10))]),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          if (_error != null)
                            Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.red[200]!)),
                              child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13)),
                            ),

                          if (_isSignUp) ...[
                            Row(children: [
                              Expanded(child: _field(_firstCtl, 'First Name', required: true)),
                              const SizedBox(width: 12),
                              Expanded(child: _field(_lastCtl, 'Last Name', required: true)),
                            ]),
                            const SizedBox(height: 12),
                          ],

                          _field(_emailCtl, 'Email', email: true, required: true),
                          const SizedBox(height: 12),
                          _field(_passCtl, 'Password', password: true, required: true),
                          const SizedBox(height: 20),

                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _loading ? null : _submit,
                              child: _loading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : Text(_isSignUp ? 'Create Account' : 'Log In', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            ),
                          ),

                          if (!_isSignUp) ...[
                            const SizedBox(height: 8),
                            TextButton(onPressed: _forgotPassword, child: const Text('Forgot Password?', style: TextStyle(color: Color(0xFF8B5E3C)))),
                          ],

                          const SizedBox(height: 8),
                          TextButton(
                            onPressed: () => setState(() { _isSignUp = !_isSignUp; _error = null; }),
                            child: Text(_isSignUp ? 'Already have an account? Log In' : "Don't have an account? Register", style: const TextStyle(color: Color(0xFF8B5E3C))),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _field(TextEditingController ctl, String label, {bool password = false, bool email = false, bool required = false}) {
    return TextFormField(
      controller: ctl,
      obscureText: password,
      keyboardType: email ? TextInputType.emailAddress : TextInputType.text,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: true,
        fillColor: const Color(0xFFF9F4EF),
      ),
      validator: required ? (v) => (v == null || v.isEmpty) ? '$label is required' : null : null,
    );
  }
}
