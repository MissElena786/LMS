import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../../Helpers/axiosInstance"

import axios from "axios";

const initialState = {

    isLoggedIn: localStorage.getItem('isLoggedIn') || false,
    role: localStorage.getItem('role') || "",
    data: localStorage.getItem('data') != undefined ? JSON.parse(localStorage.getItem('data')) : {},
  

};

export const createAccount = createAsyncThunk("/auth/signup", async (data) => {
    try {
        const res =  toast.promise(
             axios.post("http://localhost:5015/api/v1/user/register", data),  
         {
            loading: "Wait! creating your account",
            success: (data) => {
                return data?.data?.message;
            },
            error: (error)=>{
                toast.error(error?.response?.data?.message);
            }
        });
        return res?.data
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
})


export const login = createAsyncThunk('/auth/login', async (data) => {
    try {
        const response = await toast.promise(
            axios.post('http://localhost:5015/api/v1/user/login', data),
            {
                loading: 'Wait! authentication in progress...',
                success: (data) => {
                    console.log(data);
                    // Assuming data is an object with a 'message' field
                    return data?.data?.message;
                },
                error: (error) => {
                    return error?.response?.data?.message;
                }
            }
        );

        return response; // Return the response from toast.promise
    } catch (error) {
        toast.error(error?.response?.data?.message);
        throw error; // Re-throw the error to indicate that the action failed
    }
});


export const logout = createAsyncThunk("/auth/logout", async () => {
    try {
        const res = await toast.promise(
            axios.get("http://localhost:5015/api/v1/user/logout"),
             {
            loading: "Wait! logout in progress...",
            success: (data) => {
            
                return data?.data?.message;
            },
            error: "Failed to log out"
        });
        return res
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
});

// export const updateProfile = createAsyncThunk("/user/update/profile", async (data) => {
//     try {
//         const res = axiosInstance.put(`user/update/${data[0]}`, data[1]);
//         toast.promise(res, {
//             loading: "Wait! profile update in progress...",
//             success: (data) => {
//                 return data?.data?.message;
//             },
//             error: "Failed to update profile"
//         });
//         return (await res).data;
//     } catch(error) {
//         toast.error(error?.response?.data?.message);
//     }
// })
export const updateProfile = createAsyncThunk("/user/update/profile", async (data) => {
    try {
        const res = axios.put(`http://localhost:5015/api/v1/user/update`, data);
        toast.promise(res, {
            loading: "Wait! profile update in progress...",
            success: (data) => {
                return data?.data?.message;
            },
            error: "Failed to update profile"
        });
        return (await res).data;
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
})
export const forgotPassword = createAsyncThunk("/user/forgot-password", async (data) => {
    try {
        const res = axios.post(`http://localhost:5015/api/v1/user/f-password`, data);
        toast.promise(res, {
            loading: "Wait! for sending the otp on your mail...",
            success: (data) => {
                return data?.data?.message;
            },
            error: error?.response?.data?.message
        });
        return (await res).data;
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
})
export const resetPassword = createAsyncThunk("/user/verify", async (data) => {
    try {
        const res = axios.post(`http://localhost:5015/api/v1/user/verify-otp`, data);
        toast.promise(res, {
            loading: "Wait! for changing your password...",
            success: (data) => {
                return data?.data?.message;
            },
            error: error?.response?.data?.message
        });
        return (await res).data;
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
})

// export const getUserData = createAsyncThunk("/auth/me", async (id) => {
//     try {
//         const res = await axios.post("http://localhost:5015/api/v1/user/me", { id} )
//         toast.promise(res,
//              {
//             loading: "Wait! for fetching profile...",
//             success: (data) => {
            
//                 return data?.data?.message;
//             },
//             // error: error?.data?.message
//             error: error?.response?.data?.message
//         });

//         return res
//     } catch(error) {
//         toast.error(error?.response?.data?.message);
//     }
// });
export const getUserData = createAsyncThunk("/user/details", async (data) => {
    try {
        const res = axios.post("http://localhost:5015/api/v1/user/me", data);
        return (await res).data;
    } catch(error) {
        toast.error(error.message);
    }
})


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // builder
        // .addCase(login.fulfilled, (state, action) => {
        //     localStorage.setItem("data" , action?.payload?.data?.user);
        //     localStorage.setItem("isLoggedIn", true);
        //     localStorage.setItem("role", action?.payload?.data?.user?.role);
        //     console.log("action .paload..",action.payload)
        //     // localStorage.setItem("role", data.data.user.role);
        //     state.isLoggedIn = true;
        //     state.data = action?.payload?.user
        //     state.role = action?.payload?.user?.role
        // })

        builder.addCase(login.fulfilled, (state, action) => {
            const userData = JSON.stringify(action?.payload?.data?.user);
            localStorage.setItem("data", userData);
            localStorage.setItem("isLoggedIn", true);
            localStorage.setItem("role", action?.payload?.data?.user?.role);
            console.log(action.payload);
            state.isLoggedIn = true;
            state.data = action?.payload?.data?.user;
            state.role = action?.payload?.data?.user?.role;
        })
        .addCase(logout.fulfilled, (state) => {
            localStorage.clear();
            state.data = {};
            state.isLoggedIn = false;
            state.role = "";
        })
        .addCase(getUserData.fulfilled, (state, action) => {
            console.log(action.payload)
            if(!action?.payload?.user) return;
            localStorage.setItem("data", JSON.stringify(action?.payload?.user));
            localStorage.setItem("isLoggedIn", true);
            localStorage.setItem("role", action?.payload?.user?.role);
            state.isLoggedIn = true;
            state.data = action?.payload?.user;
            state.role = action?.payload?.user?.role
        });
    }
});

// export const {} = authSlice.actions;
export default authSlice.reducer;