const mongoose = require('../database');

const Schema = mongoose.Schema;

const warrantySchema = new Schema({
        product_name: {
            type: String,
            required: true
        },
        product_price: {
            type: Number,
            required: true
        },
        warranty_date: {
            type: Date,
            required: true,
        },
        client_email: {
            type: String
        },
        client_telephone: {
            type: Number
        },
        client_name: {
            type: String,
            default: `Cliente ${Date.now()}`
        },
        token: {
            type: String,
        },
        exchanges: {
            type: Number,
            default: 0
        }
    }
    ,{
        timestamps: true
    }
);

const Warranty = mongoose.model('Warranty', warrantySchema);
module.exports = Warranty;