import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import axiosInstance from "../../Helpers/axiosInstance";
import axios from "axios";
const initialState = {
    allUsersCount: 0,
    subscribedCount: 0
};

export const getStatsData = createAsyncThunk("stats/get", async () => {
    try {
        const response = axios.get("http://localhost:5015/api/v1/user/all-users");
        toast.promise(response, {
            loading: "Getting the stats...",
            success: (data) => {
                return data?.data?.message
            },
            error: "Failed to load data stats"
        });
        return (await response).data;
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
})

const statSlice = createSlice({
    name: "state",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getStatsData.fulfilled, (state, action) => {
            console.log(action.payload)
            state.allUsersCount = action?.payload?.user;
            state.subscribedCount =  action?.payload?.subscribedCount;
        })
    }
});

export default statSlice.reducer;