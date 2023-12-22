import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import CourseCard from "../../Components/CourseCard";
import HomeLayout from "../../Layouts/HomeLayout";
import { getAllCourses } from "../../Redux/Slices/CourseSlice";
import toast from "react-hot-toast";
import axios from "axios";
import { useLocation } from "react-router-dom";


function CourseList() {
    const {state} = useLocation();

    const dispatch = useDispatch();
    const [lec, setLac] = useState([])

    const {courseData} = useSelector((state) => state.course);

    async function loadCourses() {
        await dispatch(getAllCourses());
          // const lecture =  dispatch(LectureFetching(state._id))
          const lecture = await axios.get(`http://localhost:5015/api/v1/courses/get-lecture/${state?._id}`)
          if(lecture?.data?.success == true){
              toast.success("lecture fetches successfully")
              setLac(lecture?.data?.lectures)
          }
    }

    useEffect(() => {
      
            loadCourses();

    }, []);

    return (
        <HomeLayout>
            <div className="min-h-[90vh] pt-12 pl-20 flex flex-col gap-10 text-white">
                <h1 className="text-center text-3xl font-semibold mb-5">
                    Explore the courses made by
                    <span className="font-bold text-yellow-500">
                        Industry experts
                    </span>
                </h1>
                <div className="mb-10 flex flex-wrap gap-14">
                    {courseData?.map((element) => {
                        return <CourseCard key={element._id} data={element} />
                    })}
                </div>
                

            </div>
        </HomeLayout>
    );

}

export default CourseList;