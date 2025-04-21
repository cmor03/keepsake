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
      enum: ['pending', 'processing', 'completed'],
      default: 'pending',
    },
    images: [
      {
        originalImage: {
          type: String,
          required: true,
        },
        transformedImage: {
          type: String,
          default: null,
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
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema); 