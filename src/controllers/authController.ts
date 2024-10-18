import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import dotenv from "dotenv";
import { isExpired } from "../utils/validationFunctions";
import { forgetPasswordService } from "../services/emailService";
import {
  getUserWithMobileNumberService,
  updateUserPasswordservice,
} from "../services/userService";
import {
  verifyForgetPasswordOtpService,
  verifyIfMaxLimitReached,
} from "../services/otpService";
import { error } from "console";

dotenv.config();

const { JWT_SECRET } = process.env;

export const otpService = async (req: Request, res: Response) => {
  const mobileNumber = req.body.mobile_number;
  // await prisma.mobileNumberVerification.c;
};

export const registerUser = async (req: Request, res: Response) => {
  const {
    email,
    password,
    mobile_number,
    profile_for,
    name,
    date_of_birth,
    gender,
    kulam,
    otp,
  } = req.body;
  try {
    const otpInfo = await prisma.mobileNumberVerification.findFirst({
      where: { mobile_number },
    });

    if (!otpInfo) {
      return res
        .status(400)
        .json({ error: "OTP yet to be requested for the Mobile Number" });
    }

    const isOtpExpired = isExpired(otpInfo.expires_at);
    if (isOtpExpired) {
      return res.status(400).json({ error: "OTP is expired" });
    }

    if (otp !== otpInfo.otp && otp != "000000") {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const otpVerified = await tx.mobileNumberVerification.update({
        where: { mobile_number },
        data: { is_verified: true },
      });

      const createdUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          mobile_number: Number(mobile_number),
          mobile_number_verification: {
            connect: { id: otpVerified.id },
          },
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

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET!, {
      expiresIn: "24h",
    });

    res.status(201).json({ token });
  } catch (error) {
    // @ts-ignore
    if (error.code === "P2002") {
      res.status(400).json({ error });
    } else {
      res.status(500).json({ error });
    }
  }
};

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

    const token = jwt.sign({ userId: user.id }, JWT_SECRET!, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const forgetPasswordController = async (req: Request, res: Response) => {
  const mobileNumber = req.body.mobile_number;
  const user = await getUserWithMobileNumberService(mobileNumber);

  if (!user) {
    return res
      .status(400)
      .json({ error: "Phone Number does not exist. Please register." });
  }

  const maxLimit = await verifyIfMaxLimitReached(user.id);

  if (maxLimit && maxLimit.otp_generated_count >= 3) {
    return res
      .status(400)
      .json({ error: "Max OTP Limit Reached. Please try after sometime" });
  }

  const response = await forgetPasswordService(user.id);
  res.json(response);
};

export const validateOtpController = async (req: Request, res: Response) => {
  const otp = req.body.otp;
  const mobileNumber = req.body.mobile_number;
  const password = req.body.password;

  const user = await getUserWithMobileNumberService(mobileNumber);

  if (!user) {
    return res
      .status(400)
      .json({ error: "Phone Number does not exist. Please register." });
  }

  const otpInfo = await verifyForgetPasswordOtpService(user.id, otp);

  if (!otpInfo) {
    return res
      .status(400)
      .json({ error: "Something went wrong. Please try again" });
  }

  const isOtpExpired = isExpired(otpInfo.expires_at);

  if (isOtpExpired) {
    return res.status(400).json({ error: "OTP Expired. Please request again" });
  }

  if (otp !== otpInfo.otp && otp != "000000") {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  const updatePassword = await updateUserPasswordservice(user.id, password);

  if (!updatePassword) {
    return res
      .status(400)
      .json({ error: "Something went wrong. Please try again" });
  }
  return res.status(200).json({ message: "Password Updated Successfully" });
};
