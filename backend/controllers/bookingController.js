const Booking = require("../models/Booking");


// ===============================
// Create Booking
// ===============================

const createBooking = async (req, res) => {

  try {

    const {
      userId,
      service,
      price,
      paymentMethod,
      address,
    } = req.body;


    if (
      !userId ||
      !service ||
      price === undefined ||
      !paymentMethod ||
      !address
    ) {

      return res.status(400).json({

        success: false,

        message: "All fields are required",

      });

    }



    const booking = await Booking.create({

      userId,

      service,

      price,

      paymentMethod,

      address,

      bookingStatus: "Pending",

      paymentStatus:
        paymentMethod === "cod"
          ? "Pending"
          : "Paid",

    });



    res.status(201).json({

      success: true,

      message: "Booking Created Successfully",

      booking,

    });



  } catch (error) {


    console.error(
      "Create Booking Error:",
      error
    );


    res.status(500).json({

      success:false,

      message:"Server Error",

      error:error.message,

    });


  }

};




// ===============================
// Get All Bookings
// ===============================

const getAllBookings = async (req,res)=>{

  try {


    const bookings = await Booking.find()
      .populate("userId")
      .sort({
        createdAt:-1
      });



    res.status(200).json({

      success:true,

      totalBookings:bookings.length,

      bookings,

    });



  } catch(error){


    console.error(error);


    res.status(500).json({

      success:false,

      message:"Server Error",

    });


  }

};




// ===============================
// Get User Bookings
// ===============================

const getUserBookings = async(req,res)=>{

  try {


    const bookings = await Booking.find({

      userId:req.params.userId

    })
    .sort({

      createdAt:-1

    });



    res.status(200).json({

      success:true,

      totalBookings:bookings.length,

      bookings,

    });



  } catch(error){


    console.error(error);


    res.status(500).json({

      success:false,

      message:"Server Error",

    });


  }

};




// ===============================
// Get Booking By ID
// ===============================

const getBookingById = async(req,res)=>{

  try {


    const booking =
      await Booking.findById(req.params.id);



    if(!booking){

      return res.status(404).json({

        success:false,

        message:"Booking Not Found",

      });

    }



    res.status(200).json({

      success:true,

      booking,

    });



  } catch(error){


    console.error(error);


    res.status(500).json({

      success:false,

      message:"Server Error",

    });


  }

};




// ===============================
// Update Booking Status
// ===============================

const updateBookingStatus = async(req,res)=>{

  try {


    const booking =
      await Booking.findByIdAndUpdate(

        req.params.id,

        {

          bookingStatus:
            req.body.bookingStatus,


          paymentStatus:
            req.body.paymentStatus,

        },


        {

          new:true,

        }

      );



    if(!booking){

      return res.status(404).json({

        success:false,

        message:"Booking Not Found",

      });

    }



    res.status(200).json({

      success:true,

      message:"Booking Updated Successfully",

      booking,

    });



  } catch(error){


    console.error(error);


    res.status(500).json({

      success:false,

      message:"Server Error",

    });


  }

};




// ===============================
// Delete Booking
// ===============================

const deleteBooking = async(req,res)=>{

  try {


    const booking =
      await Booking.findByIdAndDelete(

        req.params.id

      );



    if(!booking){

      return res.status(404).json({

        success:false,

        message:"Booking Not Found",

      });

    }



    res.status(200).json({

      success:true,

      message:"Booking Deleted Successfully",

    });



  } catch(error){


    console.error(error);


    res.status(500).json({

      success:false,

      message:"Server Error",

    });


  }

};





module.exports = {

  createBooking,

  getAllBookings,

  getUserBookings,

  getBookingById,

  updateBookingStatus,

  deleteBooking,

};