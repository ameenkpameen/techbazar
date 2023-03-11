const mongoose = require("mongoose");

const staffData= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    phonenumber:{
        type:Number,
        required:true
    },
    
    password:{
        type:String,
        required:true
    },
    privilage:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"Active"
    }

})

module.exports = mongoose.model('Staff',staffData);