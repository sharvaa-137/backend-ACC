const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Компанийн нэр оруулна уу'],
        trim: true
    },
    registrationNumber: {
        type: String,
        trim: true,
        index: true
    },
    bankName: {
        type: String,
        trim: true
    },
    bankAccount: {
        type: String,
        trim: true,
        index: true
    },
    contactPerson: {
        type: String,
        trim: true
    },
    contactInfo: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Text index for search
companySchema.index({ name: 'text', registrationNumber: 'text', bankAccount: 'text' });

module.exports = mongoose.model('Company', companySchema);
