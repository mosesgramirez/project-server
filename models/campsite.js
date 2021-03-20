const mongoose = require('mongoose');
const Schema = mongoose.Schema; // optional

require('mongoose-currency').loadType(mongoose);

const Currency = mongoose.Types.Currency;

const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { 
    // optional second argument
    timestamps: true 
});

const campsiteSchema = new Schema(
{
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [commentSchema]
}, { 
    timestamps: true 
});

// Note: Mongoose will translate the first argument to "campsites" (plural, LC).
const Campsite = mongoose.model('Campsite', campsiteSchema);

module.exports = Campsite;

