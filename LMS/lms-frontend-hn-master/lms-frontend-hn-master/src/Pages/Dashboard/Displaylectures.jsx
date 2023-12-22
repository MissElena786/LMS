import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { LectureFetching, deleteCourseLecture, getCourseLectures } from "../../Redux/Slices/LectureSlice";
import toast from "react-hot-toast";
import axios from "axios";

function Displaylectures() {
    

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {state} = useLocation();
    // console.log(state._id)
    const {lectures} = useSelector((state) => state?.lecture);
    const [lec, setLac] = useState([])
    
    const {role} = useSelector((state) => state?.auth);
    // console.log("lecture", lectures)
    // console.log(state, )
  
    const [currentVideo, setCurrentVideo] = useState(0);
    // const [data, setData] = useState({
        //     course_id : "",
        //     lecture_id : ""
        // })
        
        async function onLectureDelete(lectureId) {
            console.log("course ID", lectureId);
          
                const deleteCourse = await axios.delete(`http://localhost:5015/api/v1/courses/remove-lecture/${lectureId}`)

                console.log("course delete", deleteCourse)
                if(deleteCourse.data.success){
                    toast.success(deleteCourse?.data?.message)
                    const lecture = await axios.get(`http://localhost:5015/api/v1/courses/get-lecture/${state._id}`)
                    if(lecture?.data?.success == true){
                        toast.success("lecture fetches successfully")
                        setLac(lecture?.data?.lectures)
                    }

                }
                // await dispatch(getCourseLectures(courseId));
            }

            
            const load = async ()=>{
                try {
                   
                    // const lecture =  dispatch(LectureFetching(state._id))
                    const lecture = await axios.get(`http://localhost:5015/api/v1/courses/get-lecture/${state._id}`)
                    if(lecture?.data?.success == true){
                        toast.success("lecture fetches successfully")
                        setLac(lecture?.data?.lectures)
                    }


                    console.log( " l",lecture);
                    // if(!state) navigate("/courses");
                //    await dispatch(getCourseLectures(state._id));
                  } catch (error) {
                    toast.error("some arror acure in api fetch")
                  }
            }
            
            useEffect( () =>{
                    load()
         
        //  console.log("video", lect)
    }, []);

    return (
        <HomeLayout>
            <div className="flex flex-col gap-10 items-center text-gray-200 justify-center min-h-[90vh] py-10 text-wihte mx-[5%]">
                <div className="text-center text-2xl font-semibold text-yellow-500">
                    Course Name: {state?.title}
                </div>

                {(lec && lec.length > 0 ) ?  
                    (<div className="flex justify-center gap-10 w-full">
                    {/* left section for playing videos and displaying course details to admin */}
                   <div className="space-y-5 w-[28rem] p-2 rounded-lg shadow-[0_0_10px_black]">
                        <video 
                            // src={lectures && lectures[currentVideo]?.lecture?.secure_url}
                            src={lec && lec[currentVideo]?.lec?.secure_url}
                            className="object-fill rounded-tl-lg rounded-tr-lg w-full"   
                            controls
                            disablePictureInPicture
                            muted
                            controlsList="nodownload"

                        >
                        </video>    
                        <div>
                            <h1>
                                <span className="text-yellow-500"> Title: {" "}
                                </span>
                                {lec && lec[currentVideo]?.title}
                            </h1>
                            <p>
                                <span className="text-yellow-500 line-clamp-4">
                                    Description: {" "}
                                </span>
                                {/* {lectures && lectures[currentVideo]?.description}
                                {lectures && lectures[currentVideo]?._id} */}
                                  {lec && lec[currentVideo]?.description}
                                {lec && lec[currentVideo]?._id}
                            </p>
                        </div>
                   </div>

                   {/* right section for displaying list of lectres */}
                   <ul className="w-[28rem] p-2 rounded-lg shadow-[0_0_10px_black] space-y-4 text-gray-200">
                        <li className="font-semibold text-xl text-yellow-500 flex items-center justify-between">
                            <p>Lectures list</p>
                            {role === "ADMIN" && (
                                <button onClick={() => navigate("/course/addlecture", {state: {...state}})} className="btn-primary px-2 py-1 rounded-md font-semibold text-sm">
                                    Add new lecture
                                </button>
                       )  }
                        </li> 
                        {
                        lec && 
                            lec?.map((lecture, idx) => {
                                return (
                                    <li className="space-y-2" key={lecture?._id} >
                                        <p className="cursor-pointer" onClick={() => setCurrentVideo(idx)}>
                                            <span>
                                                {" "} Lecture {idx + 1} : {" "}
                                            </span>
                                            {lecture?.title}
                                        </p>
                                        {role === "ADMIN" && (
                                            <button onClick={() => onLectureDelete( lecture?._id)} className="btn-accent px-2 py-1 rounded-md font-semibold text-sm">
                                                {/* {lecture._id} */}
                                                Delete lecture
                                            </button>
                                     )}
                                    </li>
                                )
                            })    
                        }
                   </ul>
                </div>) : (
                    role === "ADMIN" && (
                        <button onClick={() => navigate("/course/addlecture", {state: {...state}})} className="btn-primary px-2 py-1 rounded-md font-semibold text-sm">
                            Add new lecture
                        </button>
                    )
                )}
            </div>
        </HomeLayout>
    );
}

export default Displaylectures;