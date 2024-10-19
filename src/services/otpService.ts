import prisma from "../utils/prisma";

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const verifyIfMaxLimitReached = async (userId: number) => {
  const mobileNumberResponse =
    await prisma.changePasswordVerification.findFirst({
      where: { user: { id: userId } },
    });

  return mobileNumberResponse;
};

export const verifyForgetPasswordOtpService = async (
  userId: number,
  otp: string
) => {
  const verifyOtp = await prisma.changePasswordVerification.findFirst({
    where: { user: { id: userId } },
  });

  return verifyOtp;
};
