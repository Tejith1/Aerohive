
import React from 'react'
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <ModernHeader />

            <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-slate-900">Terms of Service</h1>
                <p className="text-slate-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-slate max-w-none space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-800">1. Acceptance of Terms</h2>
                        <p className="text-slate-600 leading-relaxed">
                            By accessing and using AeroHive ("we", "our", or "us"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-800">2. Drone Operations and Safety</h2>
                        <p className="text-slate-600 leading-relaxed">
                            <strong>2.1 Compliance:</strong> All drone operations booked through AeroHive must comply with DGCA regulations and local laws.
                            <br />
                            <strong>2.2 No-Fly Zones:</strong> Users must respect local no-fly zones. AeroHive reserves the right to cancel bookings in restricted areas.
                            <br />
                            <strong>2.3 Pilot Authority:</strong> The assigned drone pilot has the final authority to determine if flight conditions are safe.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-800">3. User Responsibilities</h2>
                        <p className="text-slate-600 leading-relaxed">
                            You agree to provide accurate information when booking services and to not use our platform for any illegal or unauthorized purpose. You are responsible for maintaining the confidentiality of your account credentials.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-800">4. Booking and Cancellations</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Cancellations made less than 24 hours before a scheduled service may be subject to a cancellation fee. Refunds are processed according to our Refund Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-800">5. Limitation of Liability</h2>
                        <p className="text-slate-600 leading-relaxed">
                            AeroHive shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-800">6. Contact Us</h2>
                        <p className="text-slate-600 leading-relaxed">
                            If you have any questions about these Terms, please contact us at support@aerohive.co.in.
                        </p>
                    </section>

                </div>
            </main>

            <ModernFooter />
        </div>
    )
}
