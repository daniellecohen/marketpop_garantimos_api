const mongoose = require('../database');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
        telephone: {
            type: Number,
        },
        email: {
            type: String,
        },
        name: {
            type: String,
            default: 'Fulano(a)'
        },
        company_name: {
            type: String,
            default: 'Barraca do(a) Fulano(a)'
        },
        warranties: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Warranty'
            }
        ],
        warranties_obs: {
            type: String,
            default: 'Produto funcionando e sem arranhões'
        },
        password: {
            type: String,
            required: true,
            select: false
        }
    }
    ,{
        timestamps: true
    }
);

userSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
})

const User = mongoose.model('User', userSchema);
module.exports = User;