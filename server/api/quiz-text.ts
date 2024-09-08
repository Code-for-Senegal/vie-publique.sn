import questions from "~/assets/data/quiz-text.json";
import type { Question } from "~/types/question";

export default defineEventHandler((): Question[] => {
  return questions;
});
