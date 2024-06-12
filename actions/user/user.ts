"use server";

import { prisma } from "@/src/lib/prisma";
import { userAction } from "@/src/lib/safe-actions";
import { z } from "zod";

export const updateUserAction = userAction(
  z.object({
    role: z.string(),
    level: z.string(),
  }),
  async (data, context) => {
    const userProfile = await prisma.userProfile.update({
      where: {
        userId: context.user.id,
      },
      data: {
        role: data.role,
        level: data.level,
        onboarded: true,
      },
    });
    return userProfile;
  }
);

export const getUserProfileAction = userAction(
  z.string(),
  async (userId, context) => {
    const userProfile = await prisma.userProfile.findUnique({
      where: {
        userId,
      },
    });
    return userProfile;
  }
);