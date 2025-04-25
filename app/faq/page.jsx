export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      
      <div className="space-y-8">
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-3">What is Keepsake?</h2>
          <p className="text-gray-700">
            Keepsake is a service that transforms real estate listing photos into beautiful coloring pages. 
            Perfect for real estate agents who want to create unique marketing materials that parents love 
            and kids enjoy.
          </p>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-3">How does it work?</h2>
          <p className="text-gray-700">
            Our process is simple: upload your photos, pay for the service, and we'll transform them into 
            coloring pages. You can then download the coloring pages directly from your account and share 
            them with your clients.
          </p>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-3">How much does it cost?</h2>
          <p className="text-gray-700">
            We offer flexible pricing based on the number of images you want to transform. Our pricing 
            starts at $5 per image, with discounts available for bulk orders. Visit our pricing page for 
            detailed information.
          </p>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-3">How long does it take to transform my images?</h2>
          <p className="text-gray-700">
            Most transformations are completed within minutes. For high-volume orders or during peak 
            times, it may take a bit longer. You'll be notified via email once your images are ready.
          </p>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-3">What image formats do you accept?</h2>
          <p className="text-gray-700">
            We accept JPG, PNG, and WebP files. For best results, we recommend uploading high-resolution 
            images with clear subjects. The maximum file size per image is 10MB.
          </p>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-3">Can I edit my coloring pages after they're created?</h2>
          <p className="text-gray-700">
            Currently, we don't offer editing capabilities within our platform. However, you can download 
            the files and make adjustments using image editing software if needed.
          </p>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-3">Do I need to create an account?</h2>
          <p className="text-gray-700">
            Yes, you'll need to create an account to use our services. This allows you to manage your orders, 
            access your transformed images, and keep track of your billing history.
          </p>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-3">Can I request revisions?</h2>
          <p className="text-gray-700">
            If you're not satisfied with a transformation, please contact our support team. While our process 
            is automated, we're happy to review specific cases and offer solutions.
          </p>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-3">What payment methods do you accept?</h2>
          <p className="text-gray-700">
            We accept all major credit cards (Visa, Mastercard, American Express, and Discover) through our 
            secure payment processor, Stripe.
          </p>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-3">Can I cancel my order?</h2>
          <p className="text-gray-700">
            Once an order is processed, it cannot be canceled as our transformation process begins immediately. 
            If you have specific concerns, please reach out to our customer support team.
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">How can I contact support?</h2>
          <p className="text-gray-700">
            You can reach our support team by emailing support@keepsake.com or by using the contact form on our 
            website. We typically respond to inquiries within 24 hours during business days.
          </p>
        </div>
      </div>
    </div>
  );
} 