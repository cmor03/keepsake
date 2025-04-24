// Stub email functions that don't actually send emails

// Send welcome email - stub function
export const sendWelcomeEmail = async (email) => {
  console.log('Email sending disabled: Welcome email would be sent to', email);
  return true;
};

// Send order confirmation email - stub function
export const sendOrderConfirmationEmail = async (email, orderNumber) => {
  console.log('Email sending disabled: Order confirmation email would be sent to', email, 'for order', orderNumber);
  return true;
};

// Send order completion email - stub function
export const sendOrderCompletionEmail = async (email, orderNumber) => {
  console.log('Email sending disabled: Order completion email would be sent to', email, 'for order', orderNumber);
  return true;
}; 