import { defineEventHandler, getCookie } from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const response = await $fetch(`${process.env.CHATBOT_API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CHATBOT_API_KEY,
      "x-csrf-token": getCookie(event, "csrf-token") || "",
    },
    body,
  });

  return response;
});
