import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary';
// import fs from 'fs/promises';
import sendEmail from "../utils/sendEmail.js";
import crypto  from 'crypto';
import bcrypt from "bcrypt"
import { promises as fs } from 'fs';
import path from 'path';
import OTP from '../models/OTP.model.js'

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: true
}

// const register = async (req, res, next) => {
//     const { fullName, email, password, secure_url } = req.body;

//     if (!fullName || !email || !password || !secure_url) {
//         return next(new AppError('All fields are required', 400));
//     }

//     const userExists = await User.findOne({ email });

//     if (userExists) {
//         return next(new AppError('Email already exists', 400));
//     }

//     const user = await User.create({
//         fullName,
//         email,
//         password,
//         avatar: {
//             public_id: email,
//             // secure_url: 'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
//             secure_url: secure_url,
//         }
//     });

//     if (!user) {
//         return next(new AppError('User registration failed, please try again', 400));
//     }

//     console.log('File Details > ', JSON.stringify(req.file));
//     if (req.file) {
//         try{
//             const result = await cloudinary.v2.uploader.upload(req.file.path, {
//                 folder: 'lms',
//                 width: 250,
//                 height: 250,
//                 gravity: 'faces',
//                 crop: 'fill'
//             });

//             if(result) {
//                 user.avatar.public_id = result.public_id;
//                 user.avatar.secure_url = result.secure_url;

//                 // Remove file from server
//                 fs.rm(`uploads/${req.file.filename}`)

//             }
//         } catch(e) {
//             return next(
//                 new AppError(e || 'File not uploaded, please try again', 500)
//             )
//         }
//     }

//     await user.save();

//     user.password = undefined;

//     const token = await user.generateJWTToken();

//     res.cookie('token', token, cookieOptions)

//     res.status(201).json({
//         success: true,
//         message: 'User registered successfully',
//         user,
//     });
// };








const register = async (req, res, next) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return next(new AppError('All fields are required', 400));
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new AppError('Email already exists', 400));
    }

    let avatarData = null; // Avatar data to store in the database
    let dataUrl ;
    if (req.file) {
        try {
            // Read the avatar file as binary data
            avatarData = await fs.readFile(req.file.path);
             dataUrl = `data:image/png;base64,${avatarData.toString('base64')}`;
            
          } catch (e) {
            return next(new AppError(e || 'File not uploaded, please try again', 500));
          }
        }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: dataUrl, // Save the binary data in the database
        },
    });

    if (!user) {
        return next(new AppError('User registration failed, please try again', 400));
    }

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();

    res.cookie('token', token, cookieOptions);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
    });
};



const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
    
        if (!email || !password) {
            return next(new AppError('All fields are required', 400));
        }
    
        const user = await User.findOne({
            email
        }).select('+password');

        if (!user) {
            return next(new AppError('does not have account with this email', 400));
        }
     

        const passwordMatch = await bcrypt.compare(password, user.password);

       if (!passwordMatch){
            return next(new AppError('Email or password does not match', 400));
       }
        
    
        const token = await user.generateJWTToken();
        user.password = undefined;
    
        res.cookie('token', token, cookieOptions);
    
        res.status(200).json({
            success: true,
            message: 'User loggedin successfully',
            user,
            token
        });
    } catch(e) {
        return next(new AppError(e.message, 500));
    }
};

const logout = (req, res) => {
    res.cookie('token', null, {
        secure: true,
        maxAge: 0,
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    })
};

const getProfile = async (req, res, next) => {
    try {
        const { id} = req.body
        // const userId = req.;
        
       if (!id){
        return next(new AppError('id is required', 400));
   }
        const user = await User.findById(id);
        console.log(user)

        res.status(200).json({
            success: true,
            message: 'User details',
            user
        });
    } catch(e) {
        return next(new AppError('Failed to fetch profile details', 500));
    }
};

const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError('Email is required', 400));
    }

    const user = await User.findOne({email});
    if (!user) {
        return next(new AppError('Email not registered', 400));
    }

    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    console.log(resetPasswordUrl);

    const subject = 'Reset Password';
    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

    try {
        await sendEmail(email, subject, message);

        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email} successfully`
        })
    } catch(e) {

        // user.forgotPasswordExpiry = undefined;
        // user.forgotPasswordToken = undefined;

        // await user.save();
        return next(new AppError(e.message, 500));
    }
}

const resetPassword = async (req, res, next) => {
    const { resetToken } = req.params;

    const { password } = req.body;

    const forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return next(
            new AppError('Token is invalid or expired, please try again', 400)
        )
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully!'
    })
}

const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    if(!oldPassword || !newPassword) {
        return next(
            new AppError('All fields are mandatory', 400)
        )
    }

    const user = await User.findById(id).select('+password');

    if(!user) {
        return next(
            new AppError('User does not exist', 400)
        )
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if(!isPasswordValid) {
        return next(
            new AppError('Invalid old password', 400)
        )
    }

    user.password = newPassword;

    await user.save();

    user.password = undefined;

    res.status(200).json({
        success: true,
        message: 'Password changed successfully!'
    });
}

// const updateUser = async (req, res) => {
//     const { fullName } = req.body;
//     const { id } = req.user.id;

//     const user = await User.findById(id);

//     if (!user) {
//         return next(
//             new AppError('User does not exist', 400)
//         )
//     }

//     if (req.fullName) {
//         user.fullName = fullName;
//     }

//     if (req.file) {
//         await cloudinary.v2.uploader.destroy(user.avatar.public_id);
//         try{
//             const result = await cloudinary.v2.uploader.upload(req.file.path, {
//                 folder: 'lms',
//                 width: 250,
//                 height: 250,
//                 gravity: 'faces',
//                 crop: 'fill'
//             });

//             if(result) {
//                 user.avatar.public_id = result.public_id;
//                 user.avatar.secure_url = result.secure_url;

//                 // Remove file from server
//                 fs.rm(`uploads/${req.file.filename}`)

//             }
//         } catch(e) {
//             return next(
//                 new AppError(e || 'File not uploaded, please try again', 500)
//             )
//         }
//     }

//     await user.save();

//     res.status(200).json({
//         success: true,
//         message: 'User details updated successfully!'
//     });

// }


const updateUser = async (req, res, next) => {
    try {
        const { fullName } = req.body;
        const { id } = req.params; // Assuming you store user ID in req.user after authentication

        const user = await User.findById(id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Update user information
        if (fullName) {
            user.fullName = fullName;
        }

        // Update avatar if a new file is provided
        if (req.file) { 
            try {
                const avatarData = await fs.readFile(req.file.path);
               const dataUrl = `data:image/png;base64,${avatarData.toString('base64')}`;

                user.avatar.secure_url = dataUrl; // Assuming avatar is stored as binary data in the database

                // Remove file from server
                await fs.unlink(req.file.path);
            } catch (e) {
                return next(new AppError('Error updating avatar', 500));
            }
        }

        await user.save();

        // Respond with updated user information (optional)
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user,
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return next(new AppError('Error updating profile', 500));
    }
};


const forgot_Password = async (req, res, next) => {
    const { email } = req.body;
    const num = "0123456789";
   
   let otp = Math.trunc(Math.random() * num)
      .toString()
      .slice(0,6)
    // console.log(otp);
    const date = new Date();
  
    // otp  = Math.trunc(Math.random())
  
    const user = await User.findOne({ email : email })
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "user not registered",
      });
    }
     
      const subject = `forgot Password`;
      const message = `hellow user your one time user otp is ${otp} at  ${date}
          <br>
          <h3>Code : ${otp} </h3>`;
      try {
  
  
        await sendEmail(email, subject, message);
  
     
  
        const isExist = await OTP.findOne({ email });
  if (!isExist) {
    await OTP.create({
      email,
      otp,
    });
    res.status(200).json({
      success: true,
      message: `OTP has been sent to your email: ${email}`,
    });
  } else if (isExist && isExist.otp === null) {
    await OTP.updateOne(
      { email: email },
      { $set: { otp } }
    );
    res.status(200).json({
      success: true,
      message: `OTP has been updated and sent to your email: ${email}`,
    });
  } else if (isExist && isExist.otp !== null) {
    res.status(200).json({
      success: true,
      message: `Your OTP has already been sent. Please check your email: ${email}`,
    });
  } else {
    return res.status(500).json({
      success: false,
      message: `Something went wrong`,
    });
  }
  
      }catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error code
          // Handle duplicate key error
          res.status(400).json({
            success: false,
            message: "An OTP has already been sent to this email. Please check your email.",
          });
        } else {
          // Handle other errors
          res.status(500).json({
            success: false,
            message: "An error occurred while processing your request.",
          });
        }
      }
    }
     
      
      
  
  
  
  const VarifyOtp = async (req, res, next) => {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      res.status(500).json({
        success: false,
        message: `All fields are mandatory.`,
      });
    }
  
    try {
      const userOTP = await OTP.findOne({ email });
  
      if (!userOTP) {
        res.status(500).json({
          success: false,
          message: `user not found with this email ${email}`,
        });
      }
  
      const otpTimestamp = userOTP.updatedAt; // Timestamp when OTP was generated
      const currentTimestamp = new Date();
      console.log(otpTimestamp)
      console.log(currentTimestamp)
  
      // Calculate the time difference in milliseconds
      const timeDifference = currentTimestamp - otpTimestamp;
      console.log(timeDifference)
  
      // Check if OTP has expired (10 minutes = 600,000 milliseconds)
      if (timeDifference > 600000) {
        await OTP.updateOne({ email: email }, { $set: { otp: null } });
        res.status(400).json({
          success: false,
          message: `OTP has expired . please request a new otp`,
        });
        
      }
  
      if (userOTP.otp == otp) {
        const hashedPassword = await bcrypt.hash(password, 10);
  
        await User.updateOne({ email: email }, { $set: { password: hashedPassword } });
  
        // Invalidate OTP by setting it to null
        await OTP.updateOne({ email: email }, { $set: { otp: null } });
  
        res.status(200).json({
          success: true,
          message: `Your password has been changed successfully`,
        });
      } else {
        res.status(500).json({
          success: false,
          message: `your otp is not matched`,
        });
      }
    } catch (error) {
      console.error('Error in VarifyOtp:', error);
      res.status(500).json({
        success: false,
        message: `An error occurred while processing your request,${error}`,
      });
    }
  };


  const getAllUSers = async (req,res)=>{
     const user = await User.find({}).count()
     if (!user) {
      return next(new AppError('Users  not found', 404));
  }
  const subscribedCount = await User.find({ "subscription" :  { $exists: true } }).count()
  // db.yourCollectionName.find({ "fieldName": { $exists: true } }).count()

  console.log(subscribedCount)

      
  res.status(200).json({
    success: true,
    message: `All Users`,
    user,
    subscribedCount
  });
  }
  
  

export {
    register,
    getAllUSers,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser,
    forgot_Password,
    VarifyOtp
}