import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import toast from "react-hot-toast";

import axiosInstance from "../../Helpers/axiosInstance";
import axios from "axios";

const initialState = {
    lectures: []
}


export const getCourseLectures = createAsyncThunk("/course/lecture/get", async (cid) => {
    try {
        const response = axios.get(`http://localhost:5015/api/v1/courses/${cid}`);
        toast.promise(response, {
            loading: "Fetching course lectures",
            success: "Lectures fetched successfully",
            error: "Failed to load the lectures"
        });
        return (await response).data;
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
});

export const addCourseLecture = createAsyncThunk("/course/lecture-add", async (data) => {
    try {
        const formData = new FormData();
        
        formData.append("lecture", data.lecture);
        formData.append("title", data.title);
        formData.append("description", data.description);


        const response = await axios.post(`http://localhost:5015/api/v1/courses/${data?.id}`, formData);
        toast.promise(response, {
            loading: "adding course lecture",
            success: "Lecture added successfully",
            error: "Failed to add the lectures"
        });
        return (await response).data;
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
});

export const deleteCourseLecture = createAsyncThunk("/course/lecture/delete", async ( id) => {
    try {
        // console.log("lec", course_id, lecture_id)
        const response = await axios.delete(`http://localhost:5015/api/v1/courses/remove-lecture/${id}`);
        // const response = await axios.delete(`http://localhost:5015/api/v1/courses/remove-lecture` ,{ data : { course_id : course_id , lecture_id:lecture_id}});
        toast.promise(response, {
            loading: "deleting course lecture",
            success: "Lecture deleted successfully",
            error: "failed to delete the lecture"
        });
        console.log(response)
        return (await response).data;
    } catch(error) {
        // console.log(error)
        toast.error(error?.response?.data?.message);
    }
});


export const LectureFetching = createAsyncThunk("/course/lecture", async (id) => {
    try {
        const response =  await  axios.get(`http://localhost:5015/api/v1/courses/get-lecture/${id}`);
        // const response = await axios.delete(`http://localhost:5015/api/v1/courses/remove-lecture` ,{ data : { course_id : course_id , lecture_id:lecture_id}});
        toast.promise(response, {
            loading: "lecture fetching",
            success: "Lecture fetches successfully",
            error: "failed to fetch the lecture"
        });
        console.log(response)
        return (await response).data;
    } catch(error) {
        // console.log(error)
        toast.error(error?.response?.data?.message);
    }
});


const lectureSlice = createSlice({
    name: "lecture",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getCourseLectures.fulfilled, (state, action) => {
            console.log(action);
            state.lectures = action?.payload?.lectures;
            // state.lectures = action.payload
        })
        .addCase(addCourseLecture.fulfilled, (state, action) => {
            console.log(action);
            state.lectures = action?.payload?.course?.lectures;
            state.lectures = action.payload

        })
    }
});

export default lectureSlice.reducer;

