import questions from "~/assets/data/quiz-photos.json";
import { Question } from "~/types/question";

export default defineEventHandler((): Question[] => {
  return questions;
});
