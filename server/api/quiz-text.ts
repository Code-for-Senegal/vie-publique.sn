import questions from "~/assets/data/quiz-text.json";
import { Question } from "~/types/question";

export default defineEventHandler((): Question[] => {
  return questions;
});
