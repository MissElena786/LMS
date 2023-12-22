import Course from "../models/couse.model.js"
import AppError from "../utills/error.utill.js"
import cloudinary from 'cloudinary'
import fs from 'fs/promises'

const getAllCourses = async function(req,res, next){


   const courses = await Course.find({}).select('-lectures')


   try {
      res.status(200).json({
         success : true,
         message : 'All Courses',
         courses
      })
   } catch (e) {
      return next(
         new AppError(e.message, 400)
      )
   }
 
}


const getLectureByCourseId = async (req, res, next)=>{

  

   try {
      
      const {id} = req.params;
      const course = await Course.findById(id)

      if(!course){
         return next(
            new AppError("invalid courses id ", 400)
         )
      }

      res.status(200).json({
         success : true,
         message : 'Course leacturs fetches successfully',
         lectures : course.lectures
      })

   } catch (e) {
      return next(
         new AppError(e.message, 400)
      )
   }
}



const createCourse = async (req, res, next)=>{

   
      const {title, description, category, createdBy} = req.body; 
   if(!title  ||  !description   || !category   ||  !createdBy){
      return next(
         new AppError(`All fields are required ${e.message}`, 500)
      )
   }

   if(!title){
      return next(
         new AppError(`title is required`, 500)
      )
   }
   if(!description){
      return next(
         new AppError(`description is required`, 500)
      )
   }
   if(!category){
      return next(
         new AppError(`category is required`, 500)
      )
   }
   if(!createdBy){
      return next(
         new AppError(`createdBy is required`, 500)
      )
   }

   try {
      const course = await Course.create({
         title,
         description,
         category,
         createdBy,
         thumbnail: {
            public_id: 'Dommy',
            secure_url: 'dommy',
         },
      });

      if (!course) {
         return next(new AppError('Course could not be created, please try again', 500));
      }

      if (req.file) {
         // Assuming the lectures array is not empty, add a new lecture
         course.lectures.push({
            title: req.file.originalname, // You might want to replace this with the actual lecture title
            description: 'Lecture description', // You might want to replace this with the actual lecture description
            lecture: {
               public_id: 'LectureDommy',
               secure_url: 'lecturedommy',
            },
         });

         // Increment the number of lectures
         course.numbersOfLectures += 1;
      }

      await course.save();

      res.status(200).json({
         success: true,
         message: 'Course created successfully',
         course,
      });
   } catch (error) {
      return next(new AppError(error.message, 400));
   }
};



const updateCourse = async (req, res, next)=>{
   try {
      const {id}= req.params
      const course  = await Course.findByIdAndUpdate(id,
         {
            $set : req.body
         },
         {
            runValidators : true
         }
         ) 

         if(!course){
            return next(
               new AppError("course with given id does not exist", 500)
            )
         }


         res.status(200).json({
            success : true,
            message: "Course updated succesfully",
            course
         })
   } catch (e) {
      return next(
         new AppError(e.message, 400)
      )
   }
}



const removeCourse = async (req, res, next)=>{
   
   try {
      
      const {id} = req.params
      const course = await Course.findById(id)

      if(!course){
         return next(
            new AppError('Course with given id does not exist', 500)
         )
      }

    await Course.findByIdAndDelete(id)

    res.status(200).json({
      success : true,
      message: "Course deleted successfully"
    })
   } catch (e) {
      return next(
         new AppError(e.message, 400)
      ) 
   }
}

// const deleteLecture = async (req, res, next) => {
//    const { course_id, lecture_id } = req.params;

//    try {
//       console.log(course_id, lecture_id);

//       // Check if course_id and lecture_id are valid ObjectId formats
//       const isValidObjectId = mongoose.Types.ObjectId.isValid(course_id) && mongoose.Types.ObjectId.isValid(lecture_id);
      
//       if (!isValidObjectId || !course_id || !lecture_id) {
//          return next(new AppError('Invalid or missing ObjectId format', 400));
//       }

//       // Find the course by its ID
//       const course = await Course.findById(course_id);

//       // Check if the course exists
//       if (!course) {
//          return next(new AppError('Course with given id does not exist', 400));
//       }

//       // Find the lecture within the course by its ID
//       const lectureToRemove = course.lectures.find(lecture => lecture._id.toString() === lecture_id);
      
//       // Check if the lecture exists in the course
//       if (!lectureToRemove) {
//          return next(new AppError('Lecture with given id does not exist in the course', 400));
//       }

//       // Remove the lecture from the array
//       course.lectures = course.lectures.filter(lecture => lecture._id.toString() !== lecture_id);
//       course.numbersOfLectures--;

//       // Uncomment the line below if you want to completely remove the lecture from the database
//       // await lectureToRemove.remove();

//       // Save the updated course
//       await course.save();

//       // Respond with a success message
//       res.status(200).json({ message: 'Lecture deleted successfully' });
//    } catch (error) {
//       console.error(error);
//       // Handle other errors, e.g., database errors
//       return next(new AppError('Failed to delete the lecture', 500));
//    }
// };


const deleteLecture = async (req, res, next) => {
   const { course_id, lecture_id } = req.body;

   try {
      // Check if course_id and lecture_id are valid ObjectId formats
      // const isValidObjectId = mongoose.Types.ObjectId.isValid(course_id) && mongoose.Types.ObjectId.isValid(lecture_id);
      
      // if (!isValidObjectId || !course_id || !lecture_id) {
      //    return next(new AppError('Invalid or missing ObjectId format', 400));
      // }

      // Find the course by its ID
      const course = await Course.findById(course_id);

      // Check if the course exists
      if (!course) {
         return next(new AppError('Course with given id does not exist', 400));
      }

      // Remove the lecture from the array using $pull
      course.updateOne({ _id: course_id }, { $pull: { lectures: { _id: lecture_id } } });

      // Decrement the number of lectures
      course.numbersOfLectures--;

      // Save the updated course
      await course.save();

      // Respond with a success message
      res.status(200).json({ success: true, message: 'Lecture deleted successfully' });
   } catch (error) {
      console.error(error);
      // Handle other errors, e.g., database errors
      return next(new AppError('Failed to delete the lecture', 500));
   }
};

const addLectureToCourseById = async  (req,res, next)=>{
   const {title, description } = req.body
   const {id} = req.params

   try {
      const course = await Course.findById(id)
      if(!course){
         return next(
            new AppError('Course with given id does not exist', 400)
         ) 
      }
      
      if(!title){
         return next(
            new AppError(`title is required`, 500)
         )
      }
      if(!description){
         return next(
            new AppError(`description is required`, 500)
         )
      }
   
   
   
   
     try {
      if(!req.file){ 
         return next(
            new AppError(`lecutre is required`, 500))
         }
         
      if (req.file && req.file.mimetype.startsWith('video/')) {
         // Check if the file is a video
         const result = await cloudinary.v2.uploader.upload(req.file.path, {
           folder: 'lms/videos', // Specify the folder for videos
           resource_type: 'video',


         });
         console.log(result)
         const {secure_url, public_id} = result
         const lectureData = {
            title : title,
            description : description,
            lecture : {
               secure_url : secure_url,
               public_id : public_id

            }
         }
   
         // if(result){
         //    // lectureData.lecture.public_id = result.public_id
         //    lectureData.lecture.secure_url = result.secure_url
         // }
         course.lectures.push(lectureData)
         course.numbersOfLectures  = course.lectures.length
   
         fs.rm(`uploads/${req.file.filename}`)
         // course.lectures.pus?h(lectureData)
       
         await course.save()
       
         res.status(200).json({
          success : true,
          message: 'lecturs successfully added to the course', 
          course
         })
      }
   
     } catch (error) {
        console.log(error)
      return next(
         new AppError(error.message, 500)
      )
     }
   
   
   } catch (e) {
      console.log(e)

      return next(
         new AppError(e.message, 400)
      ) 
   }

  
}
 

// const addLectureById = async (req, res, next) => {
//    try {
//       const { title, description } = req.body;
//       const { id } = req.params;

//       // Validate input data
//       if (!title || !description) {
//          return next(new AppError('Title and description are required', 400));
//       }

//       // Retrieve the course by ID
//       const course = await Course.findById(id);

//       if (!course) {
//          return next(new AppError('Course with given ID does not exist', 404));
//       }

//       // Upload video to Cloudinary
//       try {
//          if (req.file && req.file.mimetype.startsWith('video/')) {
//             const result = await cloudinary.v2.uploader.upload(req.file.path, {
//                folder: 'lms/videos',
//                resource_type: 'video',
//             });
            
//             const secure_url = result.secure_url
//             const public_id = result.public_id
//             const newLecture = [{
//                title,
//                description,
//                lecture : {
               
//                  public_id: public_id,
//                secure_url:secure_url,
//                }
//                // lecture : {
//                //    public_id: public_id,
//                // secure_url: secure_url 
//                // }
//             }]

//             // Update the course with the new lecture using $push
//             // const updatedCourse = await Course.findOneAndUpdate(
//             //    { _id: id },
//             //    { $push: { lectures: newLecture } },
//             //    { new: true } // Return the updated document
//             // );

//             // if (!updatedCourse) {
//             //    return next(new AppError('Course not updated', 404));
//             // }
//             try {
               
//               const crs = await Course.findByIdAndUpdate( {_id: id }, {$push: {lectures: newLecture}, updated: Date.now()}, {new: true})
//             } catch (error) {
//                console.log(error)
//                return next(new AppError('course not apdated', 500));
//             }

//             // course.lectures.push(newLecture);
//             course.numbersOfLectures = course.lectures.length;

//           await course.save()

//             return res.status(200).json({
//                success: true,
//                message: 'Lecture successfully added to the course',
              
//             });

//          } else {
//             // Handle the case where the file is not a video
//             fs.rm(`uploads/${req.file.filename}`);
//             return next(new AppError('File must be a video', 400));
//          }
//       } catch (error) {
//          console.log(error);
//          return next(new AppError(error.message, 500));
//       }
//    } catch (error) {
//       console.log(error);
//       return next(new AppError(error.message, 400));
//    }
// };


 


export {
   getAllCourses,
   // addLectureById,
   getLectureByCourseId,
   createCourse,
   updateCourse,
   removeCourse,
   addLectureToCourseById,
   deleteLecture,
   // LectureFetching
}