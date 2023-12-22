import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import HomeLayout from '../Layouts/HomeLayout';
import { login } from '../Redux/Slices/AuthSlice';
import axios from 'axios';

function Login() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const STATE = [
        localStorage.getItem("data", {}),
        localStorage.getItem("role", "")

    ]

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });
    const [token, setToken]  = useState()

    function handleUserInput(e) {
        const {name, value} = e.target;
        setLoginData({
            ...loginData,
            [name]: value
        })
    }

    async function onLogin(event) {
        event.preventDefault();
        if(!loginData.email || !loginData.password) {
            toast.error("Please fill all the details");
            return;
        }

        // dispatch create account action
        const response = await dispatch(login(loginData));
        console.log("...", response)
        if(response?.payload?.data?.success){
            const token = response?.payload?.data?.token
            console.log(token)
            navigate("/")
            setToken(token)
         
        }
       
    }

function setCookie(name, value, daysToExpire) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysToExpire);
  
    const cookieString = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/`;
  
    document.cookie = cookieString;
  }
  
  // Example usage
  setCookie('token', token,  1);

    return (
        <HomeLayout>
            <div className='flex overflow-x-auto items-center justify-center h-[100vh]'>
                <form noValidate onSubmit={onLogin} className='flex flex-col justify-center gap-3 rounded-lg p-4 text-white w-96 shadow-[0_0_10px_black]'>
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
                            value={loginData.email}
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
                            value={loginData.password}
                        />
                    </div>

                    <button type="submit" className='mt-2 bg-yellow-600 hover:bg-yellow-500 transition-all ease-in-out duration-300 rounded-sm py-2 font-semibold text-lg cursor-pointer'>
                       Login
                    </button>

                  

                </form>
            </div>
        </HomeLayout>
    );
}

export default Login;