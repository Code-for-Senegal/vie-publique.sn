<template>
  <div class="flex h-[calc(100vh-4rem)] flex-col bg-gray-50">
    <!-- En-tête -->
    <div class="border-b bg-white px-4 py-3">
      <h1 class="text-xl font-semibold text-gray-900">
        Assistant Vie Publique
      </h1>
    </div>

    <!-- Zone des messages -->
    <div class="flex-1 overflow-y-auto px-4 py-6">
      <!-- Message d'accueil -->
      <div v-if="messages.length === 0" class="mx-auto max-w-3xl text-center">
        <UIcon
          name="i-heroicons-chat-bubble-left-right"
          class="mx-auto h-12 w-12 text-gray-400"
        />
        <h2 class="mt-4 text-2xl font-bold text-gray-900">
          Bienvenue sur l'Assistant Vie Publique
        </h2>
        <p class="mt-2 text-gray-600">
          Je peux vous aider à trouver des informations sur les documents
          officiels, les lois, et l'actualité du Sénégal.
        </p>

        <!-- Questions suggérées initiales -->
        <div class="mt-8 flex flex-wrap justify-center gap-2">
          <UButton
            v-for="question in initialQuestions"
            :key="question"
            color="gray"
            variant="soft"
            class="text-left"
            @click="askQuestion(question)"
          >
            {{ question }}
          </UButton>
        </div>
      </div>

      <!-- Messages de conversation -->
      <div v-else class="mx-auto max-w-3xl space-y-6">
        <div v-for="(message, index) in messages" :key="index">
          <div
            :class="[
              'flex w-full items-start gap-4 rounded-lg p-4',
              message.isBot ? 'bg-white' : 'bg-blue-50',
            ]"
          >
            <!-- Icône -->
            <div class="flex-shrink-0">
              <UIcon
                :name="
                  message.isBot
                    ? 'i-heroicons-cpu-chip'
                    : 'i-heroicons-user-circle'
                "
                class="h-6 w-6"
                :class="message.isBot ? 'text-emerald-600' : 'text-blue-600'"
              />
            </div>

            <!-- Contenu du message -->
            <div class="flex-1">
              <div
                class="prose prose-sm max-w-none"
                v-html="formatMessage(message.text)"
              />
            </div>
          </div>

          <!-- Questions suggérées après une réponse du bot -->
          <div v-if="message.isBot && message.suggestions" class="ml-10 mt-2">
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="suggestion in message.suggestions"
                :key="suggestion"
                color="gray"
                variant="soft"
                size="sm"
                class="text-left"
                @click="askQuestion(suggestion)"
              >
                {{ suggestion }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- Indicateur de chargement -->
        <div
          v-if="isLoading"
          class="flex w-full items-start gap-4 rounded-lg bg-white p-4"
        >
          <div class="flex-shrink-0">
            <UIcon
              name="i-heroicons-cpu-chip"
              class="h-6 w-6 text-emerald-600"
            />
          </div>
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
            <div
              class="h-2 w-2 animate-bounce rounded-full bg-gray-400"
              style="animation-delay: 0.2s"
            ></div>
            <div
              class="h-2 w-2 animate-bounce rounded-full bg-gray-400"
              style="animation-delay: 0.4s"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Zone de saisie -->
    <div class="border-t bg-white p-4">
      <div class="mx-auto max-w-3xl">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <UTextarea
            v-model="userInput"
            placeholder="Posez votre question..."
            :rows="1"
            class="flex-1"
            :class="{ 'opacity-50': isLoading }"
            :disabled="isLoading"
            @keydown.enter.prevent="sendMessage"
          />
          <UButton
            type="submit"
            color="primary"
            :loading="isLoading"
            :disabled="!userInput.trim() || isLoading"
          >
            Envoyer
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from "marked";

interface Message {
  text: string;
  isBot: boolean;
  suggestions?: string[];
}

interface ChatbotRequest {
  question: string;
  chatSessionId?: string | null;
  documentIds?: string[];
}

const messages = ref<Message[]>([]);
const userInput = ref("");
const isLoading = ref(false);
const chatSessionId = ref<string | null>(null);

// Questions suggérées initiales
const initialQuestions = [
  "Qu'est-ce que le Journal Officiel ?",
  "Comment fonctionne l'Assemblée Nationale ?",
  "Quelles sont les dernières actualités ?",
  "Expliquez-moi le processus législatif",
];

const config = useRuntimeConfig();

const formatMessage = (text: string) => {
  return marked(text);
};

const askQuestion = (question: string) => {
  userInput.value = question;
  sendMessage();
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  const question = userInput.value;
  userInput.value = "";

  messages.value.push({
    text: question,
    isBot: false,
  });

  isLoading.value = true;

  try {
    const requestBody: ChatbotRequest = {
      question: question,
    };

    if (chatSessionId.value) {
      requestBody.chatSessionId = chatSessionId.value;
      requestBody.documentIds = [];
    }

    const response = await fetch(`${config.public.chatbotApiUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.public.chatbotApiKey as string,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la communication avec le chatbot");
    }

    const data = await response.json();

    if (data.chatSessionId) {
      chatSessionId.value = data.chatSessionId;
    }

    messages.value.push({
      text: data.answer || "Désolé, je n'ai pas pu traiter votre demande.",
      isBot: true,
      suggestions: data.suggestingQuestions,
    });
  } catch (error) {
    messages.value.push({
      text: "Désolé, une erreur est survenue. Veuillez réessayer.",
      isBot: true,
    });
    console.error("Erreur:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
:deep(.prose) {
  @apply max-w-none;
}

:deep(.prose p) {
  @apply mb-2 text-gray-700;
}

:deep(.prose p:last-child) {
  @apply mb-0;
}

/* Animation des points de chargement */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
