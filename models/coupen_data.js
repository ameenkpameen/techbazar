const mongoose = require("mongoose");


const coupenData = new mongoose.Schema({
    coupencode:{
        type:String,
        required:true,
        unique:true
    },
    percentoff:{
        type:Number,
        required:true,
        min:0,
        max:100
    },
    maxDiscount:{
        type:Number,
        required:true,
        min:0 
    },
    expiryDate:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        enum:['Active', 'inActive'],
        default:'Active'
    },
    minPurchaseAmount:{
        type:Number,
        required:true,
        min:0
    },
    usersUsed:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ]
})

module.exports = mongoose.model('Coupen',coupenData);