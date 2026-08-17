const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
{

    mobile:{
        type:String,
        required:true,
        unique:true
    },


    name:{
        type:String,
        default:"User"
    },


    otp:{
        type:String,
        default:null
    },


    otpExpiry:{
        type:Date,
        default:null
    },


    isVerified:{
        type:Boolean,
        default:false
    }


},
{
    timestamps:true
});


module.exports = mongoose.model(
    "User",
    userSchema
);