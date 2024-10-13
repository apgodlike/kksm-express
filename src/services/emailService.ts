import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "../utils/prisma";
import { isExpirationMoreThan24HoursFromNow } from "../utils/validationFunctions";

export const otpVerificationService = async (req: Request, res: Response) => {
  try {
    // Explicitly type the request body
    const { mobile_number, email } = req.body as {
      mobile_number: bigint;
      email: string;
    };

    if (!mobile_number || !email) {
      return res.status(400).json({ error: "Mobile number is required" });
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            mobile_number,
          },
        ],
      },
    });
    if (user) {
      return res
        .status(400)
        .json({ error: "Email or Mobile Number Exists. Please Login" });
    }

    const mobileNumberResponse =
      await prisma.mobileNumberVerification.findFirst({
        where: { mobile_number },
      });
    if (mobileNumberResponse && mobileNumberResponse.is_verified === true) {
      return res.status(400).json({ error: "Mobile Number Already Verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (mobileNumberResponse) {
      const isValid = isExpirationMoreThan24HoursFromNow(
        mobileNumberResponse.expires_at
      );

      if (mobileNumberResponse.otp_generated_count >= 3 && !isValid) {
        return res.status(400).json({
          error: "Max OTP count reached. Please try after 24 hours",
        });
      }
      const responseUpdate = await prisma.mobileNumberVerification.update({
        where: {
          mobile_number,
        },
        data: {
          mobile_number: mobile_number,
          otp,
          otp_generated_count:
            mobileNumberResponse.otp_generated_count >= 3
              ? 1
              : mobileNumberResponse.otp_generated_count + 1,
          expires_at: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
        },
      });
      return res
        .status(200)
        .json({ error: "OTP sent successfully", otp: responseUpdate.otp });
    }

    // Save the OTP in the database
    const responseCreate = await prisma.mobileNumberVerification.create({
      data: {
        mobile_number: mobile_number,
        otp,
        otp_generated_count: 1,
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
      },
    });

    // In a real-world scenario, you would send the OTP via SMS here
    // For this example, we'll just return it in the response
    return res
      .status(200)
      .json({ message: "OTP sent successfully", otp: responseCreate.otp });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code == "P2002") {
        return res.status(400).json({ message: "Mobile Number exists" });
      }
      return res.status(400).json({ error: error.message });
    }
    console.error("Error in OTP verification service:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
