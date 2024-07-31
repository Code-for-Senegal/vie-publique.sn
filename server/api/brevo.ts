// server/api/brevo.ts
const API_KEY = process.env.BREVO_API_KEY;
const BASE_URL = "https://api.brevo.com/v3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email } = body;

  try {
    const response = await $fetch(`${BASE_URL}/contacts`, {
      method: "POST",
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [parseInt(process.env.BREVO_LIST_ID)],
      }),
    });

    console.log(response);
    return { success: true, data: response };
  } catch (error) {
    console.error("Erreur lors de l'ajout du contact:", error);
    return { success: false, error: error.message };
  }
});
