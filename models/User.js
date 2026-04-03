import mongoose from "mongoose";

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
    // Rider fields
    vehicleType: { type: String, enum: ['motorcycle', 'bicycle', 'car'] },
    licensePlate: { type: String },
    driversLicense: { type: String },
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