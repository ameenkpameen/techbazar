const mongoose = require('mongoose')


const productData = new mongoose.Schema({
    
    productname:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    discription:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    orders:{
        type:Number,
        required:true
    },
    list:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
});

module.exports = mongoose.model('Product',productData);