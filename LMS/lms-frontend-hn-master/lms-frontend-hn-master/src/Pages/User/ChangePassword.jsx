import React, { useState } from 'react'
import HomeLayout from '../../Layouts/HomeLayout'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword, resetPassword } from '../../Redux/Slices/AuthSlice';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';



function ChangePassword() {
     const dispatch = useDispatch()
     const navigate = useNavigate()
    const email = useSelector((state)=> state?.auth?.data?.email)
    const [otp_flag, setOtpFlag] = useState(false)


     const [Data, setData] = useState({
          // email: "",
          email: "",
          otp : "",
          password: "",
      });
  
      function handleUserInput(e) {
          const {name, value} = e.target;
          setData({
              ...Data,
              [name]: value
          })
      }
      
      async function onReset(event) {
          event.preventDefault();
          if(!Data.email ) {
              toast.error("Please fill Email ");
              return;
          }
          try {
            const response = await axios.post("http://localhost:5015/api/v1/user/f-password", Data);
            if (response?.data?.success === true) {
              setOtpFlag(true);
              toast.success(response?.data?.message);
            } else {
              toast.error(response?.data?.message);
            }
          } catch (error) {
            toast.error(error.message || "An error occurred");
          }
          
       
      }

      const ResetPassword = async (e)=>{
        // try {
            
       
        // e.preventDefault()
        //       const result = await dispatch(resetPassword(Data))
        //       console.log(result)
        //       if(result?.data?.success == true){

        //            setOtpFlag(false)
        //       }
        //     } catch (error) {
        //         toast.error(error?.response?.data?.message)
        //     }

        try {
            const response = await axios.post("http://localhost:5015/api/v1/user/verify-otp", Data);
            if (response?.data?.success === true) {
              setOtpFlag(true);
              toast.success(response?.data?.message);
              setData({
                email: "",
                otp : "",
                password: "",
              })
              navigate("/user/profile")
            } else {
              toast.error(response?.data?.message);
            }
          } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
          }
      }
  return (
       <HomeLayout>

           <div className="min-h-[90vh] flex items-center justify-center">
        
           {/* <form noValidate */}
            <div
          className='flex flex-col justify-center gap-3 rounded-lg p-4 text-white w-96 shadow-[0_0_10px_black]'> 
            
                    <h1 className="text-center text-2xl font-bold">Login Page</h1>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="email" className='font-semibold'> Email </label>
                        <input 
                            type="email" 
                            required
                            name="email"
                            id="email"
                            placeholder="Enter your email.."
                            className="bg-transparent px-2 py-1 border"
                            onChange={handleUserInput}
                            value={Data.email}
                        />
                    </div>
                    {
                            otp_flag  && (
                          <div className='flex justify-center flex-col '>
                                                  <div className='flex flex-col gap-1'>
                        <label htmlFor="otp" className='font-semibold'> OTP </label>
                        <input 
                            type="text" 
                            required
                            name="otp"
                            id="otp"
                            placeholder="Enter your OTP.."
                            className="bg-transparent px-2 py-1 border"
                            onChange={handleUserInput}
                            value={Data.otp}
                        />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="password" className='font-semibold'> Password </label>
                        <input 
                            type="password" 
                            required
                            name="password"
                            id="password"
                            placeholder="Enter your password.."
                            className="bg-transparent px-2 py-1 border"
                            onChange={handleUserInput}
                            value={Data.password}
                        />
                    </div>

                    <button onClick={ResetPassword}  className='mt-2 px-2   text-center  bg-yellow-600 hover:bg-yellow-500 transition-all ease-in-out duration-300 rounded-sm py-2 font-semibold text-lg cursor-pointer'>
                       Reset Password
                    </button>
                          </div>
                            )
                         
                    }
                   
                   {
                    !otp_flag && (
                 <button  onClick={onReset} className='mt-2 bg-yellow-600 hover:bg-yellow-500 transition-all ease-in-out duration-300 rounded-sm py-2 font-semibold text-lg cursor-pointer'>
                       send OTP
                    </button>
                    )
                   
                   }
                   
                
                   </div>
                {/* </form> */}
            </div>

       </HomeLayout>
  
  )
}

export default ChangePassword
