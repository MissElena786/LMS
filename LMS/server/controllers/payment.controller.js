import AppError from "../utils/error.util.js";
import { razorpay } from "../server.js";
// import razorpay from "../server.js"
import dotenv from "dotenv"
import Payment from "../models/payment.model.js"
import crypto from "crypto"
import User from "../models/user.model.js";
dotenv.config()

export const getRazorpayApiKey = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Razarpay API key",
      // key: process.env.RAZORPAY_KEY_ID,
      key : process.env.RAZORPAY_KEY_ID
      
    });
  } catch (e) {
    console.log(e)

    return next(new AppError(e.message, 500));
  }
};

export const buySubscription = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      return next(new AppError("id is required ", 500));
    }
    // if (!total_count) {
    //   return next(new AppError("total count is  required ", 500));
    // }
    const user = await User.findById(id);
    // console.log(user)

    if (!user) {
      return next(new AppError("user not found with this id ", 500));
    }

    if (user.role === "ADMIN") {
      return next(new AppError("Admin cannot purchase a subscription", 400));
    }

    // const subscription = await razorpay.subscriptions.create({
    //   plan_id: process.env.RAZORPAY_PLAN_ID,
    //   customer_notify: 1,
    // });

    try {
      const subscription = await razorpay.subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        customer_notify: 1,
        total_count: 12,  // Adjust this value based on your subscription model

      });
    
      // console.log("subs",subscription)

      // Rest of the code
      
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;
    // console.log()

    await user.save(user.subscription.id, user.subscription.status);

    res.status(200).json({
      success: true,
      message: "Subscribed Successfully",
      subscription_id: subscription.id,
    });
    } catch (error) {
      console.error("Razorpay API Error:", error);
    
      if (error.statusCode === 400 && error.error && error.error.description) {
        return next(new AppError(error.error.description, 400));
      }
    
      return next(new AppError("Error subscribing to Razorpay", 500));
    }
    

  } catch (e) {
    console.log(e)
    return next(new AppError(e.message, 500));
  }
};

export const verifySubscription = async (req, res, next) => {
  try {
    // const { id } = req.body;
    const {
      id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    } = req.body;
      
    if (!id) {
      return next(new AppError("id is required", 400));
    }
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("user not found"));
    }

    const subcsriptionId = user.subscription.id;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_payment_id}|${subcsriptionId}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return next(new AppError("Payment not verified, please try again", 500));
    }

    await Payment.create({
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    });
    if (user.subscription.status === "active") {
      return next(new AppError("Subscription is already active", 400));
    }
    
    user.subscription.status = "active";
    await user.save();
    console.log(user.subscription.status)

    // user.subscription.status = "active";
    // await user.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully!",
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

// export const cancelSubscription = async (req, res, next) => {
//   try {
//     const { id } = req.body;

//     const user = await User.findById(id);

//     if (!user) {
//       return next(new AppError("User not found"));
//     }

//     if (user.role === "ADMIN") {
//       return next(new AppError("Admin cannot purchase a subscription", 400));
//     }
//     const subscriptionId = user.subscription.id;

//     const subscription = await razorpay.subscriptions.cancel(subscriptionId);
//     console.log('Subscription cancelled:', subscription);


//     user.subscription.status = subscription.status;
//     console.log('User subscription status updated:', user.subscription.status);

//     await user.save();
  
//     // ... (remaining code)
//   } catch (razorpayError) {
//     console.error('Razorpay Error:', razorpayError);
  
//     if (razorpayError.code === 'BAD_REQUEST_ERROR') {
//       return next(new AppError(razorpayError.description, 400));
//     }
  
//     // Handle other Razorpay errors as needed
//     return next(new AppError('Error cancelling subscription', 500));
//   }

//     const subscriptionId = user.subscription.id;

//     const subscription = await razorpay.subscriptions.cancel(subscriptionId);

//     user.subscription.status = subscription.status;

//     await user.save();
//   } catch (e) {
//     console.log(e)
//     return next(new AppError(e.message, 500));
//   }
// };



export const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id) {
      return next(new AppError("Id is required"));
    }
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("User not found"));
    }

    if (user.role === "ADMIN") {
      return next(new AppError("Admin cannot purchase a subscription", 400));
    }

    const subscriptionId = user.subscription.id;
    console.log(" subscription id ",subscriptionId)

    try {
      const currentSubscription = await razorpay.subscriptions.fetch(subscriptionId);
      console.log(" subscription  ",currentSubscription)


      if (currentSubscription.status === 'cancelled') {
        return next(new AppError('Subscription is already cancelled', 400));
      }

      const subscription = await razorpay.subscriptions.cancel(subscriptionId);
      console.log(" subscription ",subscriptionId)


      user.subscription.status = subscription.status;
      console.log(" subscription updated ",subscription)

      await user.save();

      res.status(200).json({
        status: 'success',
        message: 'Subscription cancelled successfully',
        data: {
          user,
        },
      });
    } catch (razorpayError) {
      console.error('Razorpay Error:', razorpayError);

      if (razorpayError.code === 'BAD_REQUEST_ERROR') {
        return next(new AppError(razorpayError.description, 400));
      }

      // Handle other Razorpay errors as needed
      return next(new AppError('Error cancelling subscription', 500));
    }
  } catch (e) {
    console.error(e);
    return next(new AppError(e.message, 500));
  }
};


export const allPayments = async (req, res, next) => {
    try {
        const { count } = req.query;

        const subscriptions = await razorpay.subscriptions.all({
            count: count || 12,

        });
        // console.log("subs",subscriptions.items.length)
        
        const totalSubscriptions = subscriptions.items.length;

        // Calculate total payments
        const totalPayments = subscriptions.items.reduce((total, subscription) => {
            // Assuming there is a property 'amount' in each subscription
            return total + subscription?.amount;
        }, 0);
        console.log(totalPayments, totalSubscriptions)

        res.status(200).json({
            success: true,
            message: 'All payments',
            subscriptions
        })
    } catch (e) {
    return next(new AppError(e.message, 500));
  }
   
};
