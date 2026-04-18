import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-muted hover:text-primary transition-colors mb-12">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        
        <h1 className="text-4xl font-black mb-4">Terms of Service</h1>
        <p className="text-muted mb-12 border-b border-border pb-6">Last updated: April 18, 2026</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the AI Social Media Manager platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
            <p>
              AI Social Media Manager provides automated scheduling, AI-assisted content generation, and multi-platform publishing tools (the "Service"). You are responsible for ensuring that all content published through our Service complies with the respective rules and guidelines of the connected third-party platforms (e.g., TikTok, LinkedIn, Twitter, Facebook).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Third-Party Platform Integrations</h2>
            <p className="mb-4">
              Our Service allows you to connect and interact with third-party social media platforms. By linking your accounts, you explicitly grant us permission to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your basic profile information.</li>
              <li>Publish content (text, images, video) to your feeds on your behalf at your scheduled request.</li>
              <li>Read basic engagement metrics necessary for the Service's dashboard functionality.</li>
            </ul>
            <p className="mt-4">
              We do not control these third-party platforms, and your use of them is subject to their individual Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. User Responsibilities</h2>
            <p>
              You agree not to use the Service to publish unauthorized, illegal, spam, or abusive content. We reserve the right to immediately terminate the accounts of any user found violating these rules or abusing the connected API endpoints.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Limitation of Liability</h2>
            <p>
              The Service is provided on an "as-is" basis. We are not liable for any account bans, suspensions, or content removals enforced by third-party platforms resulting from your use of our Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
