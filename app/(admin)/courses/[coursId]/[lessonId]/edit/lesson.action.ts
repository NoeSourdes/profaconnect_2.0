"use server";

import { prisma } from "@/src/lib/prisma";
import { userAction } from "@/src/lib/safe-actions";
import { z } from "zod";
import { lessonSchema } from "./lesson.schema";

export const createLesson = userAction(
  lessonSchema,
  async (inputs, context) => {
    const content = JSON.parse(inputs.content);
    const lesson = await prisma.lesson.create({
      data: {
        title: inputs.title,
        document: content,
        courseId: inputs.courseId,
        userId: context.user.id,
      },
    });
    return lesson;
  }
);

export const getlessons = async (id: string) => {
  // return Promise.reject("Une erreur est survenue");

  const lessons = await prisma.lesson.findMany({
    where: {
      courseId: id,
    },
  });
  return lessons;
};

export const deleteLessonAction = userAction(
  z.string(),
  async (id, context) => {
    const lesson = await prisma.lesson.findUnique({
      where: {
        lessonId: id,
        userId: context.user.id,
      },
    });

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const deletedLesson = await prisma.lesson.delete({
      where: {
        lessonId: id,
      },
    });
    return deletedLesson;
  }
);

export const checkTitleLessonAction = async (title: string) => {
  const lessonTitle = await prisma.lesson.findFirst({
    where: {
      title,
    },
  });

  if (lessonTitle) {
    return true;
  }
};