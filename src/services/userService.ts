import { Prisma, User } from "@prisma/client";
import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError";

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

export async function enableSixMonthsSubscription(userId: number) {
  const date = calculateDateSixMonthsFromNow();

  const response = await prisma.user.update({
    where: { id: userId },
    data: {
      expires_at: date,
    },
  });
  return response;
}

function calculateDateSixMonthsFromNow(): Date {
  const now = new Date();

  // Create a new date object for the future date
  const futureDate = new Date(now);

  // Add 6 months to the current date
  futureDate.setMonth(futureDate.getMonth() + 6);

  // If the day of the month in the future date is less than the current day,
  // it means we've rolled over to the next month (e.g., Jan 31 + 1 month = Feb 28/29)
  // In this case, set the date to the last day of the correct month
  if (futureDate.getDate() < now.getDate()) {
    futureDate.setDate(0);
  }

  return futureDate;
}

export const deactivateAccountService = async (userId: number) => {
  const response: User = await prisma.user.update({
    where: { id: userId },
    data: {
      is_deactivated: true,
    },
  });
  return response;
};

export const isUserDeletedVerifyByUserId = async (userId: number) => {
  try {
    const response = await prisma.user.findFirst({
      where: { id: userId },
      select: { is_deactivated: true },
    });

    if (!response || response.is_deactivated) {
      return true;
    }
    return false;
  } catch (error) {
    return true;
  }
};

export const isUserDeletedVerifyByProfileId = async (profileId: number) => {
  try {
    const response = await prisma.profile.findFirst({
      where: { id: profileId },
      select: {
        user: {
          select: { is_deactivated: true },
        },
      },
    });

    if (!response || response.user.is_deactivated) {
      return true;
    }
    return false;
  } catch (error) {
    return true;
  }
};

/* export const deleteUserData = async (userId: number): Promise<void> => {
  try {
    // First verify if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mobile_number_verification_id: true,
      },
    });

    if (!userExists) {
      throw new AppError("User not found", 404);
    }

    // Then perform deletion in transaction
    await prisma.$transaction(
      async (tx) => {
        // 1. Delete all related notifications
        await tx.notification.deleteMany({
          where: {
            OR: [
              { profile: { user_id: userId } },
              { sent_profile: { user_id: userId } },
            ],
          },
        });

        // 2. Delete profile views
        await tx.profileViews.deleteMany({
          where: {
            OR: [{ user_id: userId }, { profile: { user_id: userId } }],
          },
        });

        // 3. Delete contacts
        await tx.contact.deleteMany({
          where: {
            OR: [
              { requested_by_profile: { user_id: userId } },
              { requested_to_profile: { user_id: userId } },
            ],
          },
        });

        // 4. Delete shortlists
        await tx.shortlist.deleteMany({
          where: {
            OR: [
              { shortlisted_by_profile: { user_id: userId } },
              { shortlisted_profile_rel: { user_id: userId } },
            ],
          },
        });

        // 5. Delete payments
        await tx.payment.deleteMany({
          where: { user_id: userId },
        });

        // 6. Delete refresh token
        await tx.refreshToken.deleteMany({
          where: { user_id: userId },
        });

        // 7. Delete change password verification
        await tx.changePasswordVerification.deleteMany({
          where: { user_id: userId },
        });

        // 8. Delete profile (if exists)
        await tx.profile.deleteMany({
          where: { user_id: userId },
        });

        // 9. Delete user
        await tx.user.delete({
          where: { id: userId },
        });

        // 10. Delete mobile verification
        if (userExists.mobile_number_verification_id) {
          await tx.mobileNumberVerification.delete({
            where: { id: userExists.mobile_number_verification_id },
          });
        }
      },
      {
        maxWait: 5000, // 5 seconds maximum to wait for transaction
        timeout: 10000, // 10 seconds before transaction times out
      }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new AppError("User not found", 404);
      }
      if (error.code === "P2028") {
        throw new AppError("Transaction timeout. Please try again.", 408);
      }
    }
    throw error;
  }
};
 */
