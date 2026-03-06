export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-3xl">
            <h1 className="text-4xl font-bold mb-2 text-foreground">Terms of Service</h1>
            <p className="text-muted-foreground mb-10">Last updated: March 2026</p>

            {[
                { title: '1. Acceptance of Terms', body: 'By using the KK Rotan platform (kkrotan.com), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.' },
                { title: '2. Products & Pricing', body: 'All prices are in Malaysian Ringgit (RM) and are subject to change without notice. KK Rotan reserves the right to modify or discontinue any product at any time.' },
                { title: '3. Orders & Payment', body: 'Orders are confirmed only upon receipt of full payment. KK Rotan reserves the right to cancel any order for any reason, including pricing errors or stock unavailability, with a full refund provided.' },
                { title: '4. Shipping & Delivery', body: 'Delivery times are estimates and not guaranteed. KK Rotan is not liable for delays caused by courier services, customs, or force majeure events.' },
                { title: '5. Returns & Refunds', body: 'Returns are accepted within 7 days of delivery for unused and undamaged items. Custom orders and bulk wholesale orders are non-refundable. Shipping costs for returns are borne by the customer.' },
                { title: '6. B2B Wholesale', body: 'Wholesale pricing and quotes are subject to minimum order quantities (MOQ). All B2B agreements are governed by a separate wholesale agreement signed upon approval.' },
                { title: '7. Limitation of Liability', body: 'KK Rotan shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or platform beyond the amount paid for the specific order.' },
                { title: '8. Governing Law', body: 'These terms are governed by the laws of Malaysia. Any disputes shall be submitted to the exclusive jurisdiction of the courts in Kota Kinabalu, Sabah.' },
                { title: '9. Contact', body: 'For questions about these Terms, please contact us at legal@kkrotan.com or visit our Contact page.' },
            ].map(section => (
                <section key={section.title} className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-foreground">{section.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{section.body}</p>
                </section>
            ))}
        </div>
    )
}
