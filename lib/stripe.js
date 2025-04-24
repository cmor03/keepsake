import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a payment intent for the given amount
 * @param {number} amount - The amount to charge in cents
 * @param {object} metadata - Additional metadata for the payment
 * @returns {Promise<object>} - The payment intent
 */
export const createPaymentIntent = async (amount, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents
      currency: 'usd',
      metadata,
      payment_method_types: ['card'],
    });
    
    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Retrieves a payment intent by ID
 * @param {string} id - The payment intent ID
 * @returns {Promise<object>} - The payment intent
 */
export const retrievePaymentIntent = async (id) => {
  try {
    return await stripe.paymentIntents.retrieve(id);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

/**
 * Updates an order with payment information
 * @param {string} paymentIntentId - The ID of the payment intent
 * @param {string} orderId - The ID of the order to update
 * @returns {Promise<object>} - The updated payment intent
 */
export const updatePaymentIntentWithOrder = async (paymentIntentId, orderId) => {
  try {
    return await stripe.paymentIntents.update(paymentIntentId, {
      metadata: { orderId }
    });
  } catch (error) {
    console.error('Error updating payment intent:', error);
    throw error;
  }
};

/**
 * Calculate processing fee based on subtotal
 * @param {number} subtotal - The subtotal amount in dollars
 * @returns {number} - The processing fee in dollars
 */
export const calculateProcessingFee = (subtotal) => {
  // Implement fee calculation (e.g., 2.9% + $0.30)
  return Math.round((subtotal * 0.029 + 0.30) * 100) / 100;
};

/**
 * Calculate total amount with processing fee
 * @param {number} subtotal - The subtotal amount in dollars
 * @returns {Object} - Object containing subtotal, fee, and total
 */
export const calculateOrderAmounts = (subtotal) => {
  const fee = calculateProcessingFee(subtotal);
  const total = subtotal + fee;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    fee: parseFloat(fee.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

// Export the stripe instance directly
export { stripe }; 