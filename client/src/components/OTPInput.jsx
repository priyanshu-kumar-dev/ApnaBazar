import React, { useRef } from "react";


const OTPInput = ({otp,setOtp}) => {


    const inputRefs = useRef([]);




    const handleChange = (e,index)=>{


        const value = e.target.value;



        if(!/^[0-9]?$/.test(value)){

            return;

        }



        let otpArray = otp.split("");



        otpArray[index] = value;



        const newOTP = otpArray.join("");



        setOtp(newOTP);





        if(value && index < 5){

            inputRefs.current[index+1].focus();

        }



    };





    const handleKeyDown = (e,index)=>{


        if(

            e.key === "Backspace" &&

            !otp[index] &&

            index > 0

        ){

            inputRefs.current[index-1].focus();

        }


    };







    return (

        <div className="otp-input-container">


            {

                Array(6).fill("").map((_,index)=>(


                    <input


                    key={index}


                    ref={(element)=>

                        inputRefs.current[index]=element

                    }


                    className="otp-box"


                    type="text"


                    maxLength="1"


                    value={otp[index] || ""}


                    onChange={(e)=>

                        handleChange(e,index)

                    }


                    onKeyDown={(e)=>

                        handleKeyDown(e,index)

                    }


                    />

                ))

            }


        </div>

    );


};


export default OTPInput;