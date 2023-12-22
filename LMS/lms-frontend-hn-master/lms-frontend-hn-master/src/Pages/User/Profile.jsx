import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { getUserData } from "../../Redux/Slices/AuthSlice";
import { cancelCourseBundle } from "../../Redux/Slices/RazorpaySlice";
import { useState } from "react";

function Profile() {
    

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userData = useSelector((state) => state?.auth?.data);
    const id = useSelector((state) => state?.auth?.data?._id);
    // console.log("id",id)
   
    // console.log(userData?.avatar?.secure_url)
    const [userDataMe, setUserData] = useState({
        email : useSelector((state) => state?.auth?.data?.email),
        id : useSelector((state) => state?.auth?.data?._id)
   })

    async function handleCancellation() {
        toast("Initiating cancellation");
       const cancle =   await dispatch(cancelCourseBundle(id));
      const me =   await dispatch(getUserData(userDataMe));
        // console.log(me, cancle)
        // toast.success("Cancellation completed!");
        // navigate("/");

    }
    return (
        <HomeLayout>
            <div className="min-h-[90vh] flex items-center justify-center">
                <div className="my-10 flex flex-col gap-4 rounded-lg p-4 text-white w-96 shadow-[0_0_10px_black]">
                    <img
                    src={`${userData?.avatar?.secure_url}`}  
                        // src={userData?.avatar?.secure_url}
                        // src={blobUrl}
                        className="w-40 h-40 m-auto rounded-full border border-black"
                    />
            
                    <h3 className="text-xl font-semibold text-center capitalize">
                        {userData?.fullName}
                    </h3>
                    <div className="grid grid-cols-2">
                        <p>Email: </p><p>{userData?.email}</p>
                        <p>Role: </p><p>{userData?.role}</p>
                        <p>Subscription: </p>
                        <p>{userData?.subscription?.status === "active" ? "Action" : "Inactive"}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <Link 
                            to="/user/change-password" 
                            className="w-1/2 bg-yellow-600 hover:bg-yellow-500 transition-all ease-in-out duration-300 rounded-sm font-semibold py-2 cursor-pointer text-center">
                                <button >Change password</button>

                        </Link>
                        <Link 
                            to="/user/editprofile" 
                            className="w-1/2 bg-yellow-600 hover:bg-yellow-500 transition-all ease-in-out duration-300 rounded-sm font-semibold py-2 cursor-pointer text-center">
                                <button>Edit profile</button>

                        </Link>
                    </div>
                    {userData?.subscription?.status === "active" && (
                        <button onClick={handleCancellation} className="w-full bg-red-600 hover:bg-red-500 transition-all ease-in-out duration-300 rounded-sm font-semibold py-2 cursor-pointer text-center">
                            Cancel Subscription
                        </button>
                    )}
                </div>
            </div>
        </HomeLayout>
    );

}

export default Profile;