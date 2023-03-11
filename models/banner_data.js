
const mongoose = require('mongoose')



const bannerData = new mongoose.Schema({
    
    bannerCaption:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    subDescription:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('Banner',bannerData);