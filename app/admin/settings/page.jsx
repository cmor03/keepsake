'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    supportEmail: '',
    orderNotificationsEmail: '',
    companyAddress: '',
    companyPhone: '',
    orderProcessingTime: '24'
  });
  
  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    currencyCode: 'USD',
    basePrice: '5.00',
    taxRate: '0',
    enableDiscounts: true
  });
  
  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    enableEmailNotifications: true,
    sendWelcomeEmail: true,
    sendOrderConfirmation: true,
    sendOrderStatusUpdates: true,
    sendOrderCompleted: true,
    emailFooterText: '',
    emailLogoUrl: ''
  });
  
  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: '#4f46e5',
    secondaryColor: '#818cf8',
    darkModeEnabled: true,
    showTestimonials: true,
    maxUploadSize: '20',
    maxImagesPerOrder: '10'
  });

  // Fetch settings on page load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch settings');
        }
        
        // Populate all settings from the API response
        if (data.settings) {
          setGeneralSettings({
            siteName: data.settings.siteName || '',
            siteDescription: data.settings.siteDescription || '',
            contactEmail: data.settings.contactEmail || '',
            supportEmail: data.settings.supportEmail || '',
            orderNotificationsEmail: data.settings.orderNotificationsEmail || '',
            companyAddress: data.settings.companyAddress || '',
            companyPhone: data.settings.companyPhone || '',
            orderProcessingTime: data.settings.orderProcessingTime || '24'
          });
          
          setPaymentSettings({
            stripePublicKey: data.settings.stripePublicKey || '',
            stripeSecretKey: data.settings.stripeSecretKey || '',
            stripeWebhookSecret: data.settings.stripeWebhookSecret || '',
            currencyCode: data.settings.currencyCode || 'USD',
            basePrice: data.settings.basePrice || '5.00',
            taxRate: data.settings.taxRate || '0',
            enableDiscounts: data.settings.enableDiscounts !== false
          });
          
          setEmailSettings({
            enableEmailNotifications: data.settings.enableEmailNotifications !== false,
            sendWelcomeEmail: data.settings.sendWelcomeEmail !== false,
            sendOrderConfirmation: data.settings.sendOrderConfirmation !== false,
            sendOrderStatusUpdates: data.settings.sendOrderStatusUpdates !== false,
            sendOrderCompleted: data.settings.sendOrderCompleted !== false,
            emailFooterText: data.settings.emailFooterText || '',
            emailLogoUrl: data.settings.emailLogoUrl || ''
          });
          
          setAppearanceSettings({
            primaryColor: data.settings.primaryColor || '#4f46e5',
            secondaryColor: data.settings.secondaryColor || '#818cf8',
            darkModeEnabled: data.settings.darkModeEnabled !== false,
            showTestimonials: data.settings.showTestimonials !== false,
            maxUploadSize: data.settings.maxUploadSize || '20',
            maxImagesPerOrder: data.settings.maxImagesPerOrder || '10'
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Save settings
  const saveSettings = async (settingsType) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');
      
      let settingsToSave = {};
      
      switch (settingsType) {
        case 'general':
          settingsToSave = generalSettings;
          break;
        case 'payment':
          settingsToSave = paymentSettings;
          break;
        case 'email':
          settingsToSave = emailSettings;
          break;
        case 'appearance':
          settingsToSave = appearanceSettings;
          break;
        default:
          throw new Error('Invalid settings type');
      }
      
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: settingsType,
          settings: settingsToSave
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }
      
      setSuccessMessage(`${settingsType.charAt(0).toUpperCase() + settingsType.slice(1)} settings saved successfully!`);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes for different setting types
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: value
    });
  };
  
  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentSettings({
      ...paymentSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleEmailChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleAppearanceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppearanceSettings({
      ...appearanceSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Tab navigation
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div className="sm:col-span-2">
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={generalSettings.siteName}
                  onChange={handleGeneralChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Keepsake"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Transform your real estate listings into charming, personalized coloring pages"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={generalSettings.contactEmail}
                  onChange={handleGeneralChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="contact@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700">
                  Support Email
                </label>
                <input
                  type="email"
                  id="supportEmail"
                  name="supportEmail"
                  value={generalSettings.supportEmail}
                  onChange={handleGeneralChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="support@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="orderNotificationsEmail" className="block text-sm font-medium text-gray-700">
                  Order Notifications Email
                </label>
                <input
                  type="email"
                  id="orderNotificationsEmail"
                  name="orderNotificationsEmail"
                  value={generalSettings.orderNotificationsEmail}
                  onChange={handleGeneralChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="orders@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="orderProcessingTime" className="block text-sm font-medium text-gray-700">
                  Order Processing Time (hours)
                </label>
                <input
                  type="number"
                  id="orderProcessingTime"
                  name="orderProcessingTime"
                  value={generalSettings.orderProcessingTime}
                  onChange={handleGeneralChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  min="1"
                  max="72"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">
                  Company Address
                </label>
                <textarea
                  id="companyAddress"
                  name="companyAddress"
                  value={generalSettings.companyAddress}
                  onChange={handleGeneralChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="123 Main St, Suite 100, City, State, 12345"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700">
                  Company Phone
                </label>
                <input
                  type="text"
                  id="companyPhone"
                  name="companyPhone"
                  value={generalSettings.companyPhone}
                  onChange={handleGeneralChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => saveSettings('general')}
                disabled={saving}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        );
        
      case 'payment':
        return (
          <div className="mt-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    API keys are sensitive information. Be careful when entering or updating these values.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div className="sm:col-span-2">
                <label htmlFor="stripePublicKey" className="block text-sm font-medium text-gray-700">
                  Stripe Public Key
                </label>
                <input
                  type="text"
                  id="stripePublicKey"
                  name="stripePublicKey"
                  value={paymentSettings.stripePublicKey}
                  onChange={handlePaymentChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="pk_test_..."
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="stripeSecretKey" className="block text-sm font-medium text-gray-700">
                  Stripe Secret Key
                </label>
                <input
                  type="password"
                  id="stripeSecretKey"
                  name="stripeSecretKey"
                  value={paymentSettings.stripeSecretKey}
                  onChange={handlePaymentChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="sk_test_..."
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="stripeWebhookSecret" className="block text-sm font-medium text-gray-700">
                  Stripe Webhook Secret
                </label>
                <input
                  type="password"
                  id="stripeWebhookSecret"
                  name="stripeWebhookSecret"
                  value={paymentSettings.stripeWebhookSecret}
                  onChange={handlePaymentChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="whsec_..."
                />
              </div>
              
              <div>
                <label htmlFor="currencyCode" className="block text-sm font-medium text-gray-700">
                  Currency Code
                </label>
                <select
                  id="currencyCode"
                  name="currencyCode"
                  value={paymentSettings.currencyCode}
                  onChange={handlePaymentChange}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">
                  Base Price Per Image
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    id="basePrice"
                    name="basePrice"
                    value={paymentSettings.basePrice}
                    onChange={handlePaymentChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  id="taxRate"
                  name="taxRate"
                  value={paymentSettings.taxRate}
                  onChange={handlePaymentChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  min="0"
                  max="30"
                  step="0.01"
                />
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableDiscounts"
                      name="enableDiscounts"
                      type="checkbox"
                      checked={paymentSettings.enableDiscounts}
                      onChange={handlePaymentChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableDiscounts" className="font-medium text-gray-700">Enable Volume Discounts</label>
                    <p className="text-gray-500">Apply automatic discounts for multiple images in a single order.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => saveSettings('payment')}
                disabled={saving}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        );
      
      case 'email':
        return (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableEmailNotifications"
                      name="enableEmailNotifications"
                      type="checkbox"
                      checked={emailSettings.enableEmailNotifications}
                      onChange={handleEmailChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableEmailNotifications" className="font-medium text-gray-700">Enable Email Notifications</label>
                    <p className="text-gray-500">Send automated emails to customers and administrators.</p>
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-2 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">Customer Emails</h3>
                <p className="mt-1 text-sm text-gray-500">Configure which emails are sent to customers.</p>
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="sendWelcomeEmail"
                      name="sendWelcomeEmail"
                      type="checkbox"
                      checked={emailSettings.sendWelcomeEmail}
                      onChange={handleEmailChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sendWelcomeEmail" className="font-medium text-gray-700">Welcome Email</label>
                    <p className="text-gray-500">Send a welcome email when a new user registers.</p>
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="sendOrderConfirmation"
                      name="sendOrderConfirmation"
                      type="checkbox"
                      checked={emailSettings.sendOrderConfirmation}
                      onChange={handleEmailChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sendOrderConfirmation" className="font-medium text-gray-700">Order Confirmation</label>
                    <p className="text-gray-500">Send an email when an order is placed.</p>
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="sendOrderStatusUpdates"
                      name="sendOrderStatusUpdates"
                      type="checkbox"
                      checked={emailSettings.sendOrderStatusUpdates}
                      onChange={handleEmailChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sendOrderStatusUpdates" className="font-medium text-gray-700">Order Status Updates</label>
                    <p className="text-gray-500">Send an email when an order status changes.</p>
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="sendOrderCompleted"
                      name="sendOrderCompleted"
                      type="checkbox"
                      checked={emailSettings.sendOrderCompleted}
                      onChange={handleEmailChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sendOrderCompleted" className="font-medium text-gray-700">Order Completed</label>
                    <p className="text-gray-500">Send an email when an order is complete and ready for download.</p>
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-2 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900">Email Customization</h3>
                <p className="mt-1 text-sm text-gray-500">Customize the appearance of emails sent to customers.</p>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="emailLogoUrl" className="block text-sm font-medium text-gray-700">
                  Email Logo URL
                </label>
                <input
                  type="text"
                  id="emailLogoUrl"
                  name="emailLogoUrl"
                  value={emailSettings.emailLogoUrl}
                  onChange={handleEmailChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://example.com/logo.png"
                />
                <p className="mt-1 text-xs text-gray-500">Enter the URL for the logo to display in email headers.</p>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="emailFooterText" className="block text-sm font-medium text-gray-700">
                  Email Footer Text
                </label>
                <textarea
                  id="emailFooterText"
                  name="emailFooterText"
                  value={emailSettings.emailFooterText}
                  onChange={handleEmailChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="© 2023 Keepsake. All rights reserved."
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">This text will appear at the bottom of all emails.</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => saveSettings('email')}
                disabled={saving}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        );
      
      case 'appearance':
        return (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                  Primary Color
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={appearanceSettings.primaryColor}
                    onChange={handleAppearanceChange}
                    className="h-8 w-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={appearanceSettings.primaryColor}
                    onChange={handleAppearanceChange}
                    className="ml-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                  Secondary Color
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={appearanceSettings.secondaryColor}
                    onChange={handleAppearanceChange}
                    className="h-8 w-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    name="secondaryColor"
                    value={appearanceSettings.secondaryColor}
                    onChange={handleAppearanceChange}
                    className="ml-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="darkModeEnabled"
                      name="darkModeEnabled"
                      type="checkbox"
                      checked={appearanceSettings.darkModeEnabled}
                      onChange={handleAppearanceChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="darkModeEnabled" className="font-medium text-gray-700">Enable Dark Mode</label>
                    <p className="text-gray-500">Allow users to switch to dark mode on the website.</p>
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="showTestimonials"
                      name="showTestimonials"
                      type="checkbox"
                      checked={appearanceSettings.showTestimonials}
                      onChange={handleAppearanceChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="showTestimonials" className="font-medium text-gray-700">Show Testimonials</label>
                    <p className="text-gray-500">Display customer testimonials on the website.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="maxUploadSize" className="block text-sm font-medium text-gray-700">
                  Maximum Upload Size (MB)
                </label>
                <input
                  type="number"
                  id="maxUploadSize"
                  name="maxUploadSize"
                  value={appearanceSettings.maxUploadSize}
                  onChange={handleAppearanceChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  min="1"
                  max="50"
                />
              </div>
              
              <div>
                <label htmlFor="maxImagesPerOrder" className="block text-sm font-medium text-gray-700">
                  Maximum Images Per Order
                </label>
                <input
                  type="number"
                  id="maxImagesPerOrder"
                  name="maxImagesPerOrder"
                  value={appearanceSettings.maxImagesPerOrder}
                  onChange={handleAppearanceChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  min="1"
                  max="50"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => saveSettings('appearance')}
                disabled={saving}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-600">Configure your site settings and preferences</p>
        </div>
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            className="float-right font-bold"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
          <button 
            className="float-right font-bold"
            onClick={() => setSuccessMessage('')}
          >
            ×
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('general')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'payment'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'email'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'appearance'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Appearance
              </button>
            </nav>
          </div>
          
          <div className="px-6 py-6">
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
} 