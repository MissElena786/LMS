import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

function CourseCard({ data }) {
    console.log(data)
    const {state} = useLocation();


    const [lec, setLac] = useState([])
    const navigate = useNavigate();
    const load  = async()=>{
        const lecture = await axios.get(`http://localhost:5015/api/v1/courses/get-lecture/${state._id}`)
        if(lecture?.data?.success == true){
            toast.success("lecture fetches successfully")
            setLac(lecture?.data?.lectures)
        }
    }

    useEffect(()=>{
        load()
    },[])

    return (
        <div
            onClick={() => navigate("/course/description/", {state: {...data}})} 
            className="text-white w-[22rem] h-[430px] shadow-lg rounded-lg cursor-pointer group overflow-hidden bg-zinc-700">
            <div className="overflow-hidden">
                <img 
                    className="h-48 w-full rounded-tl-lg rounded-tr-lg group-hover:scale=[1,2] transition-all ease-in-out diration-300"
                    src={data?.thumbnail?.secure_url}
                    alt="course thumbnail"
                />
                <div className="p-3 space-y-1 text-white">
                    <h2 className="text-xl font-bold text-yellow-500 line-clamp-2">
                        {data?.title}
                    </h2>
                    <p className="line-clamp-2">
                        {data?.description}
                    </p>
                    <p className="font-semibold">
                        <span className="text-yellow-500 font-bold">Category : </span>
                        {data?.category}
                    </p>
                    <p className="font-semibold">
                        <span className="text-yellow-500 font-bold">Total lectures : </span>
                        {/* {data?.numbersOfLectures} */}
                        {/* {lec?.length} */}
                    </p>
                    <p className="font-semibold">
                        <span className="text-yellow-500 font-bold">Instructor : </span>
                        {data?.createdBy}
                    </p>
                </div>
            </div>

        </div>
    );
}

export default CourseCard;