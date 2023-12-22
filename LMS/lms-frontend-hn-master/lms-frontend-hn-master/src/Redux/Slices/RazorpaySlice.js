import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import toast from "react-hot-toast"

import axiosInstance from "../../Helpers/axiosInstance"
import axios from "axios"

const initialState = {
    key: "",
    subscription_id: "",
    isPaymentVerified: false,
    allPayments: {},
    finalMonths: {},
    monthlySalesRecord: []
}

export const getRazorPayId = createAsyncThunk("/razorpay/getId", async () => {
    try {
        const response = await axios.get("http://localhost:5015/api/v1/payments/razorpay-key");
        // console.log(response)
        return response.data;
    } catch(error) {
        toast.error("Failed to load data");
    }
})


export const purchaseCourseBundle = createAsyncThunk("/purchaseCourse", async (_id) => {
    try {
        const response = await axios.post(`http://localhost:5015/api/v1/payments/subscribe/`, {id : _id} );
        console.log(response)
        return response.data;
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
});

export const verifyUserPayment = createAsyncThunk("/payments/verify", async (data) => {
    try {
        const response = await axios.post("http://localhost:5015/api/v1/payments/verify", {
            id : data.id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_subscription_id: data.razorpay_subscription_id,
            razorpay_signature: data.razorpay_signature
        });
        return response.data;
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
});

export const getPaymentRecord = createAsyncThunk("/payments/record", async () => {
    try {
        const response = axios.get("http://localhost:5015/api/v1/payments/", );
        toast.promise(response, {
            loading: "Getting the payment records",
            success: (data) => {
                return data?.data?.message
            },
            error: "Failed to get payment records"
        })
        return (await response).data;
    } catch(error) {
        toast.error("Operation failed");
    }
});

export const cancelCourseBundle = createAsyncThunk("/payments/cancel", async (id) => {
    try {
        const response = axios.post("http://localhost:5015/api/v1/payments/unsubscribe", {id});
        toast.promise(response, {
            loading: "unsubscribing the bundle",
            success: (data) => {
                return data?.data?.message
            },
            error: "Failed to ubsubscribe"
        })
        return (await response).data;
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
});

const razorpaySlice = createSlice({
    name: "razorpay",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(getRazorPayId.fulfilled, (state, action) =>{
            state.key = action?.payload?.key;
        })
        .addCase(purchaseCourseBundle.fulfilled, (state, action) => {
            state.subscription_id = action?.payload?.subscription_id;
        })
        .addCase(verifyUserPayment.fulfilled, (state, action) => {
            console.log(action);
            toast.success(action?.payload?.message);
            state.isPaymentVerified = action?.payload?.success;
        })
        .addCase(verifyUserPayment.rejected, (state, action) => {
            console.log(action);
            toast.success(action?.payload?.message);
            state.isPaymentVerified = action?.payload?.success;
        })
        .addCase(getPaymentRecord.fulfilled, (state, action) => {
            console.log(action.payload)
            // state.allPayments = action?.payload?.allPayments;
            // state.finalMonths = action?.payload?.finalMonths;
            // state.monthlySalesRecord = action?.payload?.monthlySalesRecord;

            state.allPayments = action?.payload?.subscriptions?.count;
        state.finalMonths = action?.payload?.subscriptions?.items?.length;
        state.monthlySalesRecord = action?.payload?.subscriptions?.items;
        })
        
    }
});

export default razorpaySlice.reducer;