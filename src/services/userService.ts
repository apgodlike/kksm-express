import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";

export const getUserGenderSerivce = async (id: number) => {
  const userGender = await prisma.profile.findFirst({
    where: {
      id,
    },

    select: {
      gender: true,
    },
  });
};

export const getUserWithMobileNumberService = async (mobileNumber: number) => {
  const user = await prisma.user.findFirst({
    where: {
      mobile_number: mobileNumber,
    },
  });

  return user;
};

export const getUserRecord = async (userId: number) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  return user;
};

export const updateUserPasswordservice = async (
  userId: number,
  password: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const updateUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return updateUser;
};
