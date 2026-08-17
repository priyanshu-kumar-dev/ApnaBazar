const axios = require("axios");
const sendOTP = require("../utils/sendOTP");
const User = require("../models/User");

let otpSession = {};


// SEND OTP
exports.sendOtp = async (req, res) => {

  try {

    const { mobile } = req.body;

    console.log("Mobile:", mobile);


    const result = await sendOTP(mobile);


    console.log("OTP Result:", result);


    otpSession[mobile] = result.Details;


    res.json({

      success:true,

      message:"OTP Sent"

    });


  } catch(error) {


    console.log(
      "SEND OTP ERROR:",
      error.response?.data || error.message
    );


    res.status(500).json({

      success:false,

      message:"OTP send failed"

    });

  }

};




// VERIFY OTP
exports.verifyOtp = async (req,res)=>{

  try {


    const {mobile, otp} = req.body;


    console.log("Verify Mobile:", mobile);

    console.log("Verify OTP:", otp);



    const sessionId = otpSession[mobile];


    if(!sessionId){

      return res.status(400).json({

        success:false,

        message:"OTP session expired"

      });

    }



    const response = await axios.get(

      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`

    );



    console.log(
      "Verify Response:",
      response.data
    );



    if(response.data.Status === "Success"){



      let user = await User.findOne({
        mobile:mobile
      });



      if(!user){


        user = await User.create({

          mobile:mobile,

          name:"User"

        });


        console.log(
          "New User Created:",
          user
        );


      }
      else{


        console.log(
          "Existing User:",
          user
        );


      }



      res.json({

        success:true,

        message:"OTP Verified",

        user:user

      });



    }
    else{


      res.status(400).json({

        success:false,

        message:"Invalid OTP"

      });


    }



  } catch(error){


    console.log(
      "VERIFY ERROR:",
      error.response?.data || error.message
    );


    res.status(500).json({

      success:false,

      message:"OTP verification failed"

    });


  }

};