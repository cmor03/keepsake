export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-lg">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to Keepsake ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our website, services, and products. By accessing or using Keepsake, you agree to be bound by these Terms.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">2. Services</h2>
        <p>
          Keepsake provides a platform for transforming real estate listing photos into coloring pages. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
        <p>
          You may need to create an account to use certain features of our service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">4. User Content</h2>
        <p>
          By uploading images to our service, you grant us a non-exclusive, worldwide, royalty-free license to use, store, and process those images solely for the purpose of providing our services to you.
        </p>
        <p>
          You represent and warrant that you own or have the necessary rights to the content you submit, and that your content does not violate the rights of any third party.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">5. Prohibited Conduct</h2>
        <p>
          You agree not to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Use our services for any illegal purpose</li>
          <li>Upload content that infringes on intellectual property rights</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Use automated means to access or use our services without our permission</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">6. Payment Terms</h2>
        <p>
          Payment for our services is due at the time of purchase. All fees are non-refundable unless otherwise specified.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">7. Disclaimer of Warranties</h2>
        <p>
          OUR SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">9. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on our website.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">10. Contact</h2>
        <p>
          If you have any questions about these Terms, please contact us at support@keepsake.com.
        </p>
      </div>
    </div>
  );
} 