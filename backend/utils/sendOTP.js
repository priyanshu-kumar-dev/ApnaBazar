const axios = require("axios");


const sendOTP = async (mobile) => {

  try {

    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${mobile}/AUTOGEN`
    );


    console.log(
      "2Factor Response:",
      response.data
    );


    return response.data;


  } catch (error) {

    console.log(
      "2Factor Error:",
      error.response?.data || error.message
    );

    throw error;
  }

};


module.exports = sendOTP;