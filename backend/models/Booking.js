const mongoose = require("mongoose");


const BookingSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },


  service:{
    type:String,
    required:true
  },


  price:{
    type:Number,
    required:true
  },


  paymentMethod:{
    type:String,
    required:true
  },


  paymentStatus:{
    type:String,
    default:"Pending"
  },


  bookingStatus:{
    type:String,
    default:"Pending"
  },


  address:{

    name:{
      type:String,
      required:true
    },

    mobile:{
      type:String,
      required:true
    },

    pincode:{
      type:String,
      required:true
    },

    area:{
      type:String,
      required:true
    },

    house:{
      type:String,
      required:true
    },

    city:{
      type:String,
      required:true
    },

    state:{
      type:String,
      required:true
    },

    landmark:{
      type:String
    },

    alternatePhone:{
      type:String
    },

    addressType:{
      type:String
    }
  }
},
{
  timestamps:true
});


module.exports = mongoose.model(
  "Booking",
  BookingSchema
);