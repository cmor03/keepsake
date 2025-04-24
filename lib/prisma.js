import mongoose from 'mongoose';

// Since this project uses mongoose instead of Prisma,
// we'll create a "prisma-like" interface using mongoose
const prisma = {
  order: {
    findUnique: async ({ where, include }) => {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/keepsake');
      const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({
        id: String,
        userId: String,
        status: String,
        totalAmount: Number,
        paymentIntentId: String,
        images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderImage' }]
      }));
      
      return Order.findOne({ id: where.id }).populate(include ? 'images' : '');
    },
    update: async ({ where, data }) => {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/keepsake');
      const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({
        id: String,
        userId: String,
        status: String,
        totalAmount: Number,
        paymentIntentId: String
      }));
      
      return Order.findOneAndUpdate({ id: where.id }, data, { new: true });
    }
  },
  orderImage: {
    deleteMany: async ({ where }) => {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/keepsake');
      const OrderImage = mongoose.models.OrderImage || mongoose.model('OrderImage', new mongoose.Schema({
        orderId: String,
        url: String
      }));
      
      return OrderImage.deleteMany(where);
    }
  }
};

export { prisma }; 