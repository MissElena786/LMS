import { model, Schema } from 'mongoose';

const paymentSchema = new Schema({
    razorpay_payment_id: {
        type: String,
        required: [true, "payment id is required"]
    }, 
    razorpay_subscription_id: {
        type: String,
        required:  [true, "payment subscription is required"]
    },
    razorpay_signature: {
        type: String,
        required:  [true, "payment signature is required"]
    }
}, {
    timestamps: true
});

const Payment = model('Payment', paymentSchema);

export default Payment;
