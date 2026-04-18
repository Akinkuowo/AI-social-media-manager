import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-muted hover:text-primary transition-colors mb-12">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        
        <h1 className="text-4xl font-black mb-4">Privacy Policy</h1>
        <p className="text-muted mb-12 border-b border-border pb-6">Last updated: April 18, 2026</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
            <p className="mb-4">When you use AI Social Media Manager, we may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, password format, and billing status.</li>
              <li><strong>Third-Party Integrations:</strong> When you connect social media accounts (TikTok, Twitter, LinkedIn, etc.), we receive secure access tokens and basic profile identifying data. We heavily encrypt and securely store these tokens in our database.</li>
              <li><strong>Content Data:</strong> The captions, images, and video files you upload to our servers for the explicit purpose of scheduling and publishing to your connected platforms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We strictly use your information to operate and provide the Service to you. Specifically:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To execute automated API calls to your connected social channels at exactly the times you have requested.</li>
              <li>To provide customer support and service updates.</li>
              <li>To monitor and rapidly repair any server instability or publishing failures.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Sharing and Disclosure</h2>
            <p>
              We do not sell, rent, or trade your personal information to outside entities. We only share data with the respective third-party social media endpoints (TikTok, Twitter, etc.) precisely when you actively command the platform to publish a post to them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security & Storage</h2>
            <p>
              We implement industry-standard encryption protocols and secure database architectures to ensure your OAuth API tokens, passwords, and sensitive company materials are protected against unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Rights</h2>
            <p>
              You maintain the absolute right to digitally demand the deletion of your account and all associated secure tokens. Disconnecting any social platform via our central Settings page immediately securely wipes those API permissions from our databases.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
