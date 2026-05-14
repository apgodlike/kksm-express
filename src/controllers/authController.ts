import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import dotenv from "dotenv";
import { isExpired } from "../utils/validationFunctions";
import { forgetPasswordService } from "../services/emailService";
import {
  checkSubscription,
  deactivateAccountService,
  // deleteUserData,
  enableSixMonthsSubscription,
  getUserRecord,
  getUserWithMobileNumberService,
  setUserClaims,
  updateUserPasswordservice,
} from "../services/userService";
import {
  verifyForgetPasswordOtpService,
  verifyIfMaxLimitReached,
} from "../services/otpService";
import { error } from "console";
import { JwtPayload } from "../middlewares/authMiddleware";
import { PostDeactivateAccountDto } from "../dto/postDeactivateAccountDto";
import { getCookieDomain } from "../config";
import { AppError } from "../utils/AppError";

dotenv.config();
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = process.env;

export const registerUser = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.userId;
  // @ts-ignore
  const mobile_number = req.user.phone_number;
  const {
    // email,
    // password,
    // mobile_number,
    profile_for,
    name,
    date_of_birth,
    gender,
    kulam,
    // otp,
  } = req.body;
  try {
    const existingUser = await prisma.user.findFirst({ where: { id: userId } });
    console.log("reg", existingUser);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // const otpInfo = await prisma.mobileNumberVerification.findFirst({
    //   where: { mobile_number },
    // });

    // if (!otpInfo) {
    //   return res
    //     .status(400)
    //     .json({ error: "OTP yet to be requested for the Mobile Number" });
    // }

    // const isOtpExpired = isExpired(otpInfo.expires_at);
    // if (isOtpExpired) {
    //   return res.status(400).json({ error: "OTP is expired" });
    // }

    // if (otp !== otpInfo.otp && otp != "000000") {
    //   return res.status(400).json({ error: "Invalid OTP" });
    // }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      // const otpVerified = await tx.mobileNumberVerification.update({
      //   where: { mobile_number },
      //   data: { is_verified: true },
      // });

      const createdUser = await tx.user.create({
        data: {
          // email: email.toLowerCase(),
          // password: hashedPassword,
          id: userId,
          mobile_number: Number(mobile_number),
          // mobile_number_verification: {
          //   connect: { id: otpVerified.id },
          // },
        },
      });
      const createdProfile = await tx.profile.create({
        data: {
          profile_for: profile_for,
          name: name,
          date_of_birth: date_of_birth,
          gender: gender,
          kulam: kulam,
          contact_number: mobile_number,
          user: {
            connect: { id: createdUser.id },
          },
        },
      });

      return createdUser;
    });

    if (!newUser) {
      return res.status(400).json({ message: "Something went wrong" });
    }

    // const now = new Date();

    // const token = generateAccessToken({
    //   userId: newUser.id,
    //   isProfileCompleted: newUser.is_profile_complete,
    //   isActive: !newUser.expires_at || newUser.expires_at < now ? false : true,
    // });
    await setUserClaims(newUser.id, {
      userId: newUser.id,
      isRegistered: true,
      isProfileCompleted: false,
    });

    return res.status(201).json({ message: "Created" });
  } catch (error) {
    console.error("Error in registerUser:", error);
    if ((error as any).code === "P2002") {
      res.status(400).json({ error: "User already registered" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
/* 
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the subscription has expired
    const now = new Date();
    console.log("!user.expires_at || user.expires_at < now,", user.expires_at);
    let isActive;
    if (!user.expires_at || user.expires_at < now) {
      isActive = true;
    }

    const payload = {
      userId: user.id,
      isProfileCompleted: user.is_profile_complete,
      isActive: !user.expires_at || user.expires_at < now ? false : true,
    };

    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // await prisma.refreshToken.create({
    //   data: {
    //     token: refreshToken,
    //     user_id: payload.userId,
    //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    //   },
    // });

    await prisma.refreshToken.upsert({
      where: { user_id: payload.userId },
      update: {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      create: {
        token: refreshToken,
        user_id: payload.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
      // domain: ".kovaikongumatrimony.com",
      domain: getCookieDomain(),
      // domain: "192.168.29.126",
    });

    res.json({ token, refreshToken });
  } catch (error) {
    res.status(500).json({ error });
  }
};
 */
// export const refreshAccessToken = async (req: Request, res: Response) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;
//     console.log("res.cookies", req.cookies);
//     console.log("refreshToken", refreshToken);
//     if (!refreshToken) {
//       return res.status(401).json({ error: "Refresh token not found" });
//     }

//     const payload = verifyRefreshToken(refreshToken);

//     console.log("payload", payload);
//     const storedToken = await prisma.refreshToken.findFirst({
//       where: {
//         token: refreshToken,
//         user_id: payload.userId,
//         expiresAt: { gt: new Date() },
//       },
//     });

//     if (!storedToken) {
//       return res.status(401).json({ error: "Invalid refresh token" });
//     }

//     const newAccessToken = generateAccessToken(payload);
//     const newRefreshToken = generateRefreshToken(payload);

//     const ress = await prisma.refreshToken.delete({
//       where: { id: storedToken.id },
//     });
//     await prisma.refreshToken.create({
//       data: {
//         token: newRefreshToken,
//         user_id: payload.userId,
//         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//       },
//     });

//     res.cookie("refreshToken", newRefreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       // domain: ".kovaikongumatrimony.com",
//       domain: getCookieDomain(),
//       // domain: "192.168.29.126",
//     });
//     console.log("newAccessToken,", newAccessToken);
//     return res.status(200).json({ token: newAccessToken });
//   } catch (error) {
//     res.status(401).json({ error: "Invalid refresh token" });
//   }
// };

export const getLogoutUserController = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.userId;
    console.log("Here");
    console.log("userIduserId", userId);

    const refreshToken = req.cookies.refreshToken;

    console.log("refreshToken", refreshToken);

    const response = await prisma.refreshToken.delete({
      where: {
        token: refreshToken,
        user_id: userId,
      },
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      domain: getCookieDomain(),
      // Only include path if you specified it when setting the cookie
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in getLogoutUserController:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const generateAccessToken = (user: JwtPayload) => {
  const token = jwt.sign(
    {
      userId: user.userId,
      isProfileCompleted: user.isProfileCompleted,
      isActive: user.isActive,
    },
    JWT_ACCESS_SECRET!,
    {
      expiresIn: "15m",
    }
  );
  return token;
};

export const generateRefreshToken = (user: JwtPayload) => {
  return jwt.sign(
    {
      userId: user.userId,
      isProfileCompleted: user.isProfileCompleted,
      isActive: user.isActive,
    },
    JWT_REFRESH_SECRET!,
    {
      expiresIn: "7d",
    }
  );
};

// export const verifyRefreshToken = (token: string): JwtPayload => {
//   try {
//     console.log("JWT_REFRESH_SECRET!", JWT_REFRESH_SECRET!);
//     return jwt.verify(token, JWT_REFRESH_SECRET!) as JwtPayload;
//   } catch (error) {
//     throw new Error("Invalid refresh token");
//   }
// };

// export const forgetPasswordController = async (req: Request, res: Response) => {
// const mobileNumber = req.body.mobile_number;
// const user = await getUserWithMobileNumberService(Number(mobileNumber));

// if (!user) {
//   return res
//     .status(400)
//     .json({ error: "Phone Number does not exist. Please register." });
// }

// const maxLimit = await verifyIfMaxLimitReached(user.id);

// if (maxLimit && maxLimit.otp_generated_count >= 3) {
//   return res
//     .status(400)
//     .json({ error: "Max OTP Limit Reached. Please try after sometime" });
// }

// const response = await forgetPasswordService(user.id);
// res.json({ otp: response.otp });
// };

// export const changePasswordController = async (req: Request, res: Response) => {
//   const mobileNumber = req.body.mobile_number;
//   // @ts-ignore
//   const userId = req.user.userId;
//   const userRecord = await getUserRecord(userId);
//   console.log("userId: ", userId);

//   if (!userRecord || !userId) {
//     return res.status(400).json({ error: "Mobile Number does not match." });
//   }

//   if (mobileNumber != userRecord.mobile_number) {
//     return res
//       .status(400)
//       .json({ error: "Mobile Number does not match with our Record." });
//   }

//   const maxLimit = await verifyIfMaxLimitReached(userRecord.id);

//   if (maxLimit && maxLimit.otp_generated_count >= 3) {
//     return res
//       .status(400)
//       .json({ error: "Max OTP Limit Reached. Please try after sometime" });
//   }

//   const response = await forgetPasswordService(userRecord.id);
//   res.json({ otp: response.otp });
// };

// export const validateOtpController = async (req: Request, res: Response) => {
//   const otp = req.body.otp;
//   const mobileNumber = req.body.mobile_number;
//   const password = req.body.password;

//   const user = await getUserWithMobileNumberService(Number(mobileNumber));

//   if (!user) {
//     return res
//       .status(400)
//       .json({ error: "Phone Number does not exist. Please register." });
//   }

//   const otpInfo = await verifyForgetPasswordOtpService(user.id, otp);

//   if (!otpInfo) {
//     return res
//       .status(400)
//       .json({ error: "Something went wrong. Please try again" });
//   }

//   const isOtpExpired = isExpired(otpInfo.expires_at);

//   if (isOtpExpired) {
//     return res.status(400).json({ error: "OTP Expired. Please request again" });
//   }

//   if (otp !== otpInfo.otp && otp != "000000") {
//     return res.status(400).json({ error: "Invalid OTP" });
//   }

//   const updatePassword = await updateUserPasswordservice(user.id, password);

//   if (!updatePassword) {
//     return res
//       .status(400)
//       .json({ error: "Something went wrong. Please try again" });
//   }
//   return res.status(200).json({ message: "Password Updated Successfully" });
// };

export const validateAsLoggedInOtpController = async (
  req: Request,
  res: Response
) => {
  try {
    const otp = req.body.otp;
    // @ts-ignore
    const userId = req.user.userId;
    const password = req.body.password;

    if (!userId) {
      return res.status(400).json({ error: "Something went Wrong" });
    }

    const otpInfo = await verifyForgetPasswordOtpService(userId, otp);

    if (!otpInfo) {
      return res
        .status(400)
        .json({ error: "Something went wrong. Please try again" });
    }

    const isOtpExpired = isExpired(otpInfo.expires_at);

    if (isOtpExpired) {
      return res
        .status(400)
        .json({ error: "OTP Expired. Please request again" });
    }

    if (otp !== otpInfo.otp && otp != "000000") {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const updatePassword = await updateUserPasswordservice(userId, password);

    if (!updatePassword) {
      return res
        .status(400)
        .json({ error: "Something went wrong. Please try again" });
    }
    return res.status(200).json({ message: "Password Updated Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCheckSubscriptionController = async (
  req: Request,
  res: Response
) => {
  try {
    // @ts-ignore
    const userId = req.user.userId;

    if (!userId) {
      return res.status(404).json({ error: "User Not Found" });
    }

    const { isSubscribed, message } = await checkSubscription(userId);
    return res.status(200).json({ is_subscribed: isSubscribed, message });
  } catch (error) {
    console.error("Error checking subscription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const postSubscriptionController = async (
  req: Request,
  res: Response
) => {
  try {
    // @ts-ignore
    const userId = req.user.userId;
    const requestedSubscription = req.body.request_subscription;

    if (!userId) {
      return res.status(404).json({ error: "User Not Found" });
    }

    const { isSubscribed, message } = await checkSubscription(userId);

    if (isSubscribed) {
      return res.status(400).json({ error: "Already Subscribed" });
    }
    if (!requestedSubscription) {
      return res.status(400).json({ error: "Subscription Not Requested" });
    }
    const response = await enableSixMonthsSubscription(userId);

    if (!response || !response.expires_at) {
      return res.status(400).json({ error: "Something went wrong" });
    }

    const now = new Date();

    if (response.expires_at < now) {
      return res
        .status(200)
        .json({ is_subscribed: false, message: "Subscription has expired" });
    }

    // const token = generateAccessToken({
    //   userId: response.id,
    //   isProfileCompleted: response.is_profile_complete,
    //   isActive:
    //     !response.expires_at || response.expires_at < now ? false : true,
    // });

    // removed token refer below line
    return res.status(200).json({ is_subscribed: true, message: "Subscribed" });
    // return res
    //   .status(200)
    //   .json({ is_subscribed: true, message: "Subscribed", token });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deactivateAccountController = async (
  req: Request<{}, {}, PostDeactivateAccountDto>,
  res: Response
) => {
  try {
    // @ts-ignore
    const userId = req.user.userId;
    const { deactivate_account } = req.body;
    if (!deactivate_account) {
      return res.status(400).json({ error: "Deactivation Not Requested" });
    }

    const response = await deactivateAccountService(userId);
    if (response.is_deactivated) {
      return res.status(200).json({ is_deactivated: true });
    }
    return res.status(400).json({ error: "Account Not Deleted" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const deleteAccountController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // @ts-ignore
//     const userId = req.user.userId;
//     // const userId = parseInt(req.params.userId);

//     if (isNaN(userId)) {
//       throw new AppError("Invalid user ID", 400);
//     }

//     await deleteUserData(userId);

//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       domain: getCookieDomain(),
//       // Only include path if you specified it when setting the cookie
//     });

//     return res.status(200).json({
//       status: "success",
//       message: "User and associated data deleted successfully",
//     });
//   } catch (error) {
//     next(error);
//   }
// };
