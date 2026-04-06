import mongoose from "mongoose";

const sellerReviewSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    reviewerId: { type: String, required: true },
    reviewerName: { type: String, default: "" },
    reliability: { type: Number, required: true, min: 1, max: 5 },
    speed: { type: Number, required: true, min: 1, max: 5 },
    communication: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    overall: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    imageUrl: { type: String, required: true },
    cartItems: {type: Object, default: {} },
    // Seller fields
    businessName: { type: String },
    businessLocation: { type: String },
    phoneNumber: { type: String },
    businessLicense: { type: String },
    taxId: { type: String },
    sellerSubscriptionPlan: { type: String, default: "standard" },
    sellerSubscriptionStatus: { type: String, enum: ['active', 'paused', 'overdue'], default: 'active' },
    sellerSubscriptionFee: { type: Number, default: 0 },
    sellerReviews: { type: [sellerReviewSchema], default: [] },
    sellerRatingSummary: {
        totalReviews: { type: Number, default: 0 },
        reliability: { type: Number, default: 0 },
        speed: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        overall: { type: Number, default: 0 },
    },
    // Rider fields
    vehicleType: { type: String, enum: ['motorcycle', 'bicycle', 'car'] },
    licensePlate: { type: String },
    driversLicense: { type: String },
    riderAvailability: { type: String, enum: ['available', 'busy'], default: 'available' },
    // Common fields
    isVerified: { type: Boolean, default: false },
    verificationDocuments: [{ type: String }],
    notifications: [{
        type: { type: String, enum: ['message', 'order', 'system'] },
        title: { type: String },
        message: { type: String },
        read: { type: Boolean, default: false },
        date: { type: Date, default: Date.now }
    }],
    messages: [{
        from: { type: String }, // userId of sender
        to: { type: String }, // userId of receiver
        subject: { type: String },
        content: { type: String },
        read: { type: Boolean, default: false },
        date: { type: Date, default: Date.now }
    }]
}, { minimize: false })

const User = mongoose.models.user || mongoose.model('user', userSchema)

export default User
