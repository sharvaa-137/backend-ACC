const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Компани сонгоно уу']
    },
    amount: {
        type: Number,
        required: [true, 'Мөнгөн дүн оруулна уу']
    },
    transactionDate: {
        type: Date,
        required: [true, 'Огноо оруулна уу'],
        index: true
    },
    bankName: {
        type: String,
        trim: true
    },
    bankAccount: {
        type: String,
        trim: true
    },
    contactInfo: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid'
    }
}, {
    timestamps: true
});

// Index for date-based queries and payment status filtering
transactionSchema.index({ transactionDate: 1, companyId: 1 });
transactionSchema.index({ paymentStatus: 1, transactionDate: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
