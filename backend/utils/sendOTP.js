const axios = require("axios");

const sendOTP = async (mobile) => {
  try {
    console.log("Mobile sent to 2Factor:", mobile);
    console.log(
      "API KEY EXISTS:",
      !!process.env.TWO_FACTOR_API_KEY
    );

    const phone = mobile.startsWith("+91")
      ? mobile
      : `+91${mobile}`;

    const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${phone}/AUTOGEN`;

    console.log("2Factor URL:", url.replace(
      process.env.TWO_FACTOR_API_KEY,
      "HIDDEN"
    ));

    const response = await axios.get(url);

    console.log("2Factor Response:", response.data);

    return response.data;

  } catch (error) {
    console.log(
      "2Factor Error:",
      error.response?.data || error.message
    );

    console.log(
      "2Factor Status:",
      error.response?.status
    );

    throw error;
  }
};

module.exports = sendOTP;