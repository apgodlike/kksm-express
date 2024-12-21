import prisma from "../utils/prisma";

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const verifyIfMaxLimitReached = async (userId: string) => {
  const mobileNumberResponse =
    await prisma.changePasswordVerification.findFirst({
      where: { user: { id: userId } },
    });

  return mobileNumberResponse;
};

export const verifyForgetPasswordOtpService = async (
  userId: string,
  otp: string
) => {
  const verifyOtp = await prisma.changePasswordVerification.findFirst({
    where: { user: { id: userId } },
  });

  return verifyOtp;
};
