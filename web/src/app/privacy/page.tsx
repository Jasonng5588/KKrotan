export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-3xl">
            <h1 className="text-4xl font-bold mb-2 text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground mb-10">Last updated: March 2026</p>

            {[
                { title: '1. Information We Collect', body: 'We collect information you provide directly, including your name, email address, phone number, and shipping address when you register or place an order. We also collect usage data such as IP address, browser type, and pages visited.' },
                { title: '2. How We Use Your Information', body: 'We use your information to: process and fulfill orders, send order confirmations and shipping updates, respond to customer service inquiries, send promotional emails (with your consent), and improve our platform and services.' },
                { title: '3. Data Sharing', body: 'KK Rotan does not sell or rent your personal data to third parties. We share data only with trusted service providers (e.g., payment processors, courier services) strictly for fulfilling your orders.' },
                { title: '4. Data Storage & Security', body: 'Your data is stored securely using Supabase (PostgreSQL) with row-level security enabled. We use industry-standard encryption (TLS/SSL) for all data transmission. Despite our efforts, no security system is impenetrable.' },
                { title: '5. Cookies', body: 'We use essential cookies for authentication and session management. Analytics cookies may be used to understand usage patterns. You can disable non-essential cookies in your browser settings.' },
                { title: '6. Your Rights', body: 'Under Malaysian Personal Data Protection Act (PDPA) 2010, you have the right to access, correct, or request deletion of your personal data. Contact us at privacy@kkrotan.com to exercise these rights.' },
                { title: '7. Retention', body: 'We retain your personal data for as long as your account is active or as needed to provide services. Order records are retained for 7 years for legal and accounting compliance.' },
                { title: '8. Children\'s Privacy', body: 'Our platform is not intended for users under 18 years of age. We do not knowingly collect personal information from children.' },
                { title: '9. Contact Us', body: 'If you have questions about this Privacy Policy, contact our Data Protection Officer at privacy@kkrotan.com.' },
            ].map(section => (
                <section key={section.title} className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-foreground">{section.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{section.body}</p>
                </section>
            ))}
        </div>
    )
}
