import prisma from "../utils/prisma";

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
