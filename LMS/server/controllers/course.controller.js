import Course from "../models/couse.model.js";
import AppError from "../utils/error.util.js";
import fs from "fs/promises";
import cloudinary from "cloudinary";
import { resourceLimits } from "worker_threads";
import { title } from "process";
import Lecture from "../models/Lecture.model.js";
import mongoose from "mongoose";

const getAllCourses = async function (req, res, next) {
  try {
    const courses = await Course.find({}).select("-lectures");

    res.status(200).json({
      success: true,
      message: "All courses",
      courses,
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

const getLecturesByCourseId = async function (req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("Invalid course id", 400));
    }

    res.status(200).json({
      success: true,
      message: "Course lectures fetched successfully",
      lectures: course.lectures,
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

const createCourse = async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy) {
    return next(new AppError("All fields are required", 400));
  }

  const course = await Course.create({
    title,
    description,
    category,
    createdBy,
    thumbnail: {
      public_id: "Dummy",
      secure_url: "Dummy",
    },
  });

  if (!course) {
    return next(
      new AppError("Course could not created, please try again", 500)
    );
  }

  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });
      console.log(JSON.stringify(result));
      if (result) {
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }

      fs.rm(`uploads/${req.file.filename}`);
    } catch (e) {
      return next(new AppError(e.message, 500));
    }
  }

  await course.save();

  res.status(200).json({
    success: true,
    message: "Course created successfully",
    course,
  });
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      {
        runValidators: true,
      }
    );

    if (!course) {
      return next(new AppError("Course with given id does not exist", 500));
    }

    res.status(200).json({
      success: true,
      message: "Course updated succesfully!",
      course,
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

const removeCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("Course with given id does not exist", 500));
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

const addLectureToCourseById = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;

    if (!title || !description) {
      return next(new AppError("All fields are required", 400));
    }

    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("Course with given id does not exist", 500));
    }

    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          resource_type: "video",
        });
        const { public_id, secure_url } = result;

        const lecutureData = {
          title,
          description,
          lecture: {
            public_id,
            secure_url,
          },
        };
        if (result) {
          lecutureData.lecture.public_id = result.public_id;
          lecutureData.lecture.secure_url = result.secure_url;
        }
        console.log("lecture> ", JSON.stringify(lecutureData));
        course.lectures.push(lecutureData);

        course.numbersOfLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
          success: true,
          message: "Lecture successfully added to the course",
          course,
        });

        fs.rm(`uploads/${req.file.filename}`);
      } catch (e) {
        console.log(e);
        return next(new AppError(e.message, 500));
      }
    }
  } catch (e) {
    console.log(e);
    return next(new AppError(e.message, 500));
  }
};


const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: "lms",
      resource_type: "video",
    });
     console.log("result",result)
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new AppError("Failed to upload to Cloudinary", 500);
  }
};

const AddLecture = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, secure_url } = req.body;
  console.log(id , req.body)

  try {
    // Input validation
    if (!id || !title || !description) {
      throw new AppError("All fields are required", 400);
    }

    // Fetch the course
    const course = await Course.findById(id);
    if (!course) {
      throw new AppError("Course with given id does not exist", 400);
    }

    // Upload to Cloudinary if a file is present
    let url;
  
    if (req.file) {
      url = await uploadToCloudinary(req.file.path);
      console.log("url.",url)
    }
    console.log(url)
    // if(!url){
    //   throw new AppError("url is not generated ", 400);
    // }

    // Create and save the lecture
    const lecture = await Lecture.create({
      title: title,
      description: description,
      lecture_id: id, // Consistent naming
      secure_url: secure_url,
    });
    console.log(lecture)

    if (!lecture) {
      throw new AppError("Failed to create lecture", 500);
    }

    res.status(200).json({
      success: true,
      message: "Lecture successfully added to the course",
      lecture,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

const LectureFetching = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {

      return next(new AppError("Invalid ID provided", 400));
    }

    const lectures = await Lecture.find({ "lecture_id" : id });
    console.log(lectures)

    if (!lectures) {
      return next(new AppError("Lectures  not found", 400));
    }

    return res.status(200).json({
      success: true,
      message: "Lecture successfully fetched",
      lectures,
    });
  } catch (error) {
    console.log(error)
    // Handle specific MongoDB errors if needed
    return next(new AppError(`Error fetching lecture: ${error.message}`, 500));
  }
};




const deleteLectureBYID = async (req, res, next)=>{
      const {id} = req.params
      if (!id) {
        return next(new AppError("id is requried", 400));
      }
 try {
      const lecture = await Lecture.findById(id)

      if (!lecture) {
        return next(new AppError("Lectures  not found", 400));
      }

      await lecture.deleteOne({lecture})
      

      return res.status(200).json({
        success: true,
        message: "lecture deleted successfully",
      });
    } catch (error) {
      return next(new AppError(`Error deleting lecture: ${error.message}`, 500));
    }

}

export {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
  addLectureToCourseById,
  // addLectureById,
  LectureFetching,
  AddLecture,
  deleteLectureBYID
};
