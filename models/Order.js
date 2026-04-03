import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' },
    sellerId: { type: String, required: true, ref: 'User' },
    items: [{
        product: { type: String, required: true, ref: 'Product' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    amount: { type: Number, required: true },
    address: { type: String, ref: 'address', required: true },
    status: { type: String, required: true, default: 'Order Placed', enum: ['Order Placed', 'Confirmed', 'Preparing', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'] },
    paymentStatus: { type: String, default: 'Pending', enum: ['Pending', 'Paid', 'Failed'] },
    deliveryRequired: { type: Boolean, default: true },
    riderId: { type: String, ref: 'User' },
    deliveryFee: { type: Number, default: 0 },
    sellerNotes: { type: String },
    customerPhone: { type: String },
    date: { type: Number, required: true }
});

// Make variable name consistent with export
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
