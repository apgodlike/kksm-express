import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import prisma from "../utils/prisma";

export const otpVerificationService = async (req: Request, res: Response) => {
  try {
    // Explicitly type the request body
    const { mobile_number } = req.body as { mobile_number: bigint };

    if (!mobile_number) {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save the OTP in the database
    await prisma.mobileNumberVerification.create({
      data: {
        mobile_number: mobile_number,
        otp,
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
      },
    });

    // In a real-world scenario, you would send the OTP via SMS here
    // For this example, we'll just return it in the response
    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (error) {
    console.error("Error in OTP verification service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
