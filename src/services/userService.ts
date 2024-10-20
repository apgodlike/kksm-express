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

export async function checkSubscription(
  userId: number
): Promise<{ isSubscribed: boolean; message: string }> {
  const userRecord = await getUserRecord(userId);

  if (!userRecord) {
    throw new Error("User Not Found");
  }

  // If expires_at is null, the user has never subscribed
  if (!userRecord.expires_at) {
    return { isSubscribed: false, message: "User has never subscribed" };
  }

  // Check if the subscription has expired
  const now = new Date();
  if (userRecord.expires_at < now) {
    return { isSubscribed: false, message: "Subscription has expired" };
  }

  // If we've reached here, the user has an active subscription
  return { isSubscribed: true, message: "Subscription is active" };
}
