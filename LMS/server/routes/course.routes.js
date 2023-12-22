import { Router } from 'express';
import {   LectureFetching, createCourse, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse, AddLecture, deleteLectureBYID } from '../controllers/course.controller.js';
import { authorizeSubscriber, authorizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';
// import { addLectureToCourseById } from '../controllers/course.controllers.js';
// import { addLectureToCourseById, addLectureById, deleteLecture, LectureFetching } from '../controllers/course.controllers.js';


const router = Router();

router.route('/')
    .get(getAllCourses)
    .post(
        // isLoggedIn,
        // authorizedRoles('ADMIN'),
        upload.single('thumbnail'),
        createCourse
    );

// router.route('/:course_id/remove-lecture/:lecture_id')
router.route('/remove-lecture/:id')
.delete(
    deleteLectureBYID
)
router.route('/get-lecture/:id')
.get(
    LectureFetching
    )

router.route('/:id')
    .get(
        // isLoggedIn, authorizeSubscriber,
         getLecturesByCourseId)
    .put(
        // isLoggedIn,
        // authorizedRoles('ADMIN'),
        updateCourse
    )
    .delete(
        // isLoggedIn,
        // authorizedRoles('ADMIN'),
        removeCourse
    )
    .post(
        // isLoggedIn,
        // authorizedRoles('ADMIN'),
        upload.single('/file'),
        // addLectureToCourseById
        AddLecture
    );
    // .get(
    //     // isLoggedIn,
    //     // authorizedRoles('ADMIN'),
    //     upload.single('lecture'),
    //     addLectureById
    // );

export default router;

