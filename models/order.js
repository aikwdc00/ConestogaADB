// FU-TING, LI, Student No: 8819152

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
      product: {
        //  type: Object,
        // type: Schema.Types.ObjectId,
        // ref: 'Product',
        title: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        description: {
          type: String,
          required: true
        },
        imageUrl: {
          type: String,
          required: true
        },
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
      },
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    email: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
