import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'awaiting_payment', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    images: [
      {
        originalImage: {
          type: String,
          // required: true, // Filename might become optional if URL is primary
        },
        originalImageUrl: { // ADDED: URL for original blob
          type: String,
          // required: true, // REMOVED: This must be optional now
        },
        transformedImage: {
          type: String,
          default: null,
        },
        transformedImageUrl: { // ADDED: URL for transformed blob
           type: String,
           default: null,
        },
        status: { // ADDED: Status for individual image processing
           type: String,
           enum: ['pending', 'processing', 'completed', 'failed'],
           default: 'pending',
        },
        name: String,
        dateUploaded: {
          type: Date,
          default: Date.now,
        },
        dateTransformed: Date,
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    processingFee: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    paymentIntentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'awaiting_payment', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    customerEmail: {
      type: String,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema); 