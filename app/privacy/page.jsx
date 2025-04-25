export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-lg">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          At Keepsake, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
        <p>
          We collect the following types of information:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and login credentials.</li>
          <li><strong>Order Information:</strong> We collect details about your purchases, including billing information and transaction history.</li>
          <li><strong>Image Data:</strong> We store the images you upload to our service for processing and transformation.</li>
          <li><strong>Usage Information:</strong> We collect data about how you interact with our website, including pages visited and features used.</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
        <p>
          We use your information to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide and improve our services</li>
          <li>Process transactions and send order confirmations</li>
          <li>Respond to your inquiries and support requests</li>
          <li>Send updates and marketing communications (with your consent)</li>
          <li>Detect and prevent fraudulent activities</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">4. Data Sharing and Disclosure</h2>
        <p>
          We may share your information with:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Service Providers:</strong> Third-party companies that help us operate our business (payment processors, hosting providers, etc.)</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
        </ul>
        <p>
          We do not sell your personal information to third parties.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">6. Data Retention</h2>
        <p>
          We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">7. Your Rights</h2>
        <p>
          Depending on your location, you may have the right to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access the personal information we hold about you</li>
          <li>Correct inaccurate or incomplete information</li>
          <li>Delete your personal information</li>
          <li>Object to or restrict certain processing activities</li>
          <li>Request the transfer of your data</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">8. Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can manage your cookie preferences through your browser settings.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">9. Children's Privacy</h2>
        <p>
          Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">10. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on our website.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">11. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at privacy@keepsake.com.
        </p>
      </div>
    </div>
  );
} 