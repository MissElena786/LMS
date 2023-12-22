import { Router } from "express";
import { VarifyOtp, changePassword, forgotPassword, forgot_Password, getAllUSers, getProfile, login, logout, register, resetPassword, updateUser } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";


const router = Router();

router.post('/register', upload.single("avatar"), register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/me', getProfile);
router.get('/all-users', getAllUSers);
router.post('/forgot-password', forgotPassword);
router.post('/reset/:resetToken',isLoggedIn, resetPassword);
router.post('/change-password', isLoggedIn, changePassword);
router.put('/update/:id', upload.single("avatar"), updateUser)
router.post('/f-password', forgot_Password);
router.post('/verify-otp', VarifyOtp);

export default router;