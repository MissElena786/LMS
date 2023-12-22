import  Express   from "express";
import { Router } from "express";
import app from "../app.js";
import {register ,login , logout, getProfile ,resetPassword, forgotPassword, changePassword, updateUser} from "../controllers/user.controller.js"
import { isLoggedIn } from "../middlewares/auth.middelware.js";
import upload from "../middlewares/multer.middeleware.js";
const routes = Express.Router()


routes.post('/register',upload.single('avatar'),  register)
routes.post('/login', login)
routes.get('/logout', logout)
routes.get('/me', isLoggedIn, getProfile)
routes.post('/forgot-password', forgotPassword)
// routes.post('/reset-password',isLoggedIn, resetPassword)
routes.post('/reset-password', resetPassword)
routes.post('/change-password', isLoggedIn ,changePassword)
routes.put('/update-user', isLoggedIn,upload.single('avatar') , updateUser)

export default routes