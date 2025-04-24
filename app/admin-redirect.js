/**
 * Admin Redirect Utility
 * 
 * This file provides a function to redirect admin users to the admin dashboard.
 * It's a workaround for any redirect issues that might occur.
 */
export const redirectToAdmin = () => {
  // Try multiple methods to ensure redirection works
  try {
    // Method 1: window.location.href
    window.location.href = '/admin/dashboard';
  } catch {
    try {
      // Method 2: window.location.assign
      window.location.assign('/admin/dashboard');
    } catch {
      try {
        // Method 3: document.location
        document.location.href = '/admin/dashboard';
      } catch {
        // Method 4: Set window.location directly
        window.location = '/admin/dashboard';
      }
    }
  }
}; 