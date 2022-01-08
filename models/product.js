const mongoose = require('mongoose');
const {Schema} = mongoose


const productSchema = new Schema({
	name: {type: String, required: true},
	price: {type: Number, required: true, min:[0, 'Precio imposible']},
	category: {
        type: String,
        lowercase: true,
        enum: ['fruit', 'vegetable', 'dairy'],
        default:['fruit']
    },
    farm: {
        type: Schema.Types.ObjectId,
        ref: 'Farm'
    }
});

// Creación de la tabla / colección
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
