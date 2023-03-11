const mongoose = require('mongoose');

const Product = require('../models/product_data');


const orderData= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    orderId: {
      type: String,
      unique: true,
      required: true,
      
    },
    deliveryAddress: {
      type: String,
      required: true
    },
    paymentmethod: {
      type: String,
      required: true
    },
    products: [{
        productId: {
          type:  mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        producttotal: {
          type: Number,
          required: true
        }
    }],
    
    totalprice: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Pending','Confirmed','Shipped','Delivered','Cancelled','Payment Failed'],
      default: 'Pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
    

})

module.exports = mongoose.model('Order',orderData);