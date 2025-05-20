<template>
  <div class="flex h-[calc(100vh-4rem)] flex-col bg-gray-50 dark:bg-gray-900">
    <!-- Zone des messages -->
    <div class="flex-1 overflow-y-auto px-4 py-4 md:py-6">
      <!-- Message d'accueil -->
      <div
        v-if="messages.length === 0"
        class="mx-auto max-w-3xl py-12 text-center"
      >
        <UIcon
          name="i-heroicons-chat-bubble-left-right"
          class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
        />
        <h1 class="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Bienvenue sur l'Assistant Vie Publique
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Je peux vous aider à trouver des informations sur les documents
          officiels, les lois, et l'actualité du Sénégal.
        </p>

        <!-- Questions suggérées initiales -->
        <div class="mt-8 flex flex-wrap justify-center gap-2">
          <TransitionGroup
            name="message"
            tag="ul"
            class="w-full max-w-md space-y-2"
          >
            <li
              v-for="(question, index) in initialQuestions"
              :key="index"
              :style="{ animationDelay: `${index * 100}ms` }"
              class="animate-in"
            >
              <UButton
                :label="question"
                class="my-1 w-full py-3 text-left font-normal dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                color="gray"
                variant="soft"
                @click="askQuestion(question)"
              />
            </li>
          </TransitionGroup>
        </div>
      </div>

      <!-- Messages de conversation -->
      <div v-else class="mx-auto max-w-3xl space-y-6">
        <div ref="chatContainer" class="space-y-6">
          <div v-for="(message, index) in messages" :key="index">
            <!-- Message utilisateur -->
            <div
              v-if="!message.isBot"
              class="group flex w-full justify-end gap-2 pb-4"
            >
              <div class="flex items-end gap-2">
                <!-- Bouton de copie -->
                <div
                  class="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                >
                  <UTooltip text="Copier le message" :delay-duration="0">
                    <UButton
                      :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
                      variant="ghost"
                      size="xs"
                      color="gray"
                      @click="copy(message.text)"
                    />
                  </UTooltip>
                </div>
              </div>
              <!-- Contenu message -->
              <div
                class="prose dark:prose-invert max-w-[80%] rounded-l-xl rounded-t-xl bg-blue-500 px-4 py-3 text-white shadow-sm md:max-w-[70%] dark:bg-blue-600"
              >
                <div
                  v-html="
                    formatMessage(message.progressiveText ?? message.text)
                  "
                />
              </div>
            </div>

            <!-- Message bot -->
            <div v-else class="group pb-4">
              <div class="flex items-start gap-3">
                <!-- Icône bot -->
                <!-- <div class="mt-1 flex-shrink-0">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
                  >
                    <UIcon
                      name="i-heroicons-cpu-chip"
                      class="h-5 w-5 text-blue-600 dark:text-blue-300"
                    />
                  </div>
                </div> -->

                <div class="flex-1 space-y-2">
                  <!-- Contenu du message -->
                  <div
                    class="max-w-[100%] rounded-r-xl rounded-t-xl bg-white p-4 md:max-w-[90%] dark:bg-gray-800"
                  >
                    <div class="max-w-none">
                      <div
                        v-html="
                          formatMessage(message.progressiveText ?? message.text)
                        "
                      />
                    </div>
                  </div>

                  <!-- Documents -->

                  <!-- Suggestions -->
                  <div
                    v-if="message.suggestions?.length"
                    class="flex max-w-full flex-wrap gap-2 pt-1"
                  >
                    <UButton
                      v-for="suggestion in message.suggestions"
                      :key="suggestion"
                      color="gray"
                      variant="soft"
                      size="xs"
                      class="max-w-full whitespace-normal break-words text-left sm:max-w-[300px] dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      @click="askQuestion(suggestion)"
                    >
                      {{ suggestion }}
                    </UButton>
                  </div>

                  <!-- Bouton de copie -->
                  <div
                    class="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  >
                    <UButton
                      :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
                      variant="ghost"
                      size="xs"
                      color="gray"
                      @click="copy(message.text)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Indicateur de chargement -->
        <div v-if="isLoading" class="flex items-start gap-3">
          <div class="mt-1 flex-shrink-0">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
            >
              <UIcon
                name="i-heroicons-cpu-chip"
                class="h-5 w-5 text-blue-600 dark:text-blue-300"
              />
            </div>
          </div>
          <div
            class="flex h-8 items-center rounded-full bg-white px-4 py-2 shadow-sm dark:bg-gray-800"
          >
            <div class="flex items-center gap-1">
              <div
                class="h-2 w-2 animate-pulse rounded-full bg-gray-400 dark:bg-gray-500"
              ></div>
              <div
                class="h-2 w-2 animate-pulse rounded-full bg-gray-400 dark:bg-gray-500"
                style="animation-delay: 0.2s"
              ></div>
              <div
                class="h-2 w-2 animate-pulse rounded-full bg-gray-400 dark:bg-gray-500"
                style="animation-delay: 0.4s"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Zone de saisie -->
    <div
      class="mb-4 border-t bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mx-auto max-w-3xl">
        <form
          class="relative flex w-full flex-col gap-4"
          @submit.prevent="sendMessage"
        >
          <CsrfToken />
          <UTextarea
            ref="textareaRef"
            v-model="userInput"
            placeholder="Posez une question..."
            color="primary"
            variant="outline"
            class="w-full"
            :rows="3"
            :max-rows="12"
            size="xl"
            :autoresize="true"
            :ui="{
              base: 'rounded-3xl resize-none pb-12 px-4 pt-4 md:text-sm',
            }"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.shift.enter.prevent="userInput += '\n'"
          />
          <div class="absolute bottom-3 right-3 flex items-center gap-2">
            <UButton
              type="submit"
              color="primary"
              variant="solid"
              size="sm"
              icon="i-lucide-arrow-up"
              class="rounded-full transition-opacity"
              :disabled="!userInput.trim() || isLoading"
              :ui="{ base: 'disabled:opacity-20' }"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from "marked";
import { useClipboard } from "@vueuse/core";

const { copy, copied } = useClipboard({ legacy: true });

interface Message {
  text: string;
  isBot: boolean;
  suggestions?: string[];
  progressiveText?: string;
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
const chatContainer = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLElement | null>(null);

// Questions suggérées initiales
const initialQuestions = [
  "Résumé du dernier conseil des ministres ?",
  "Quel âge faut-il avoir pour se syndiquer au Sénégal ?",
  "Les sénégalais majeurs ont-ils le droit de prendre une autre nationalité ?",
];

const config = useRuntimeConfig();

const formatMessage = (text: string) => {
  // Traitement des liens [[texte]](url) (optionnel)
  const processedText = text.replace(
    /\[\[(.*?)\]\]\((.*?)\)/g,
    (match, text, url) => {
      return `<a href="${url}" class="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900" target="_blank" rel="noopener noreferrer">
        ${text}
        <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-4 w-4" />
      </a>`;
    },
  );

  const renderer = new marked.Renderer();

  // Surcharge du rendu des liens markdown classiques [texte](url)
  renderer.link = function ({
    href,
    title: _title,
    text,
  }: {
    href: string;
    title?: string | null;
    text?: string;
  }) {
    return `<a href="${href}" class="inline-flex items-center gap-1 underline underline-offset-2 text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer">
      ${text}
      <span class="ml-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 3h7m0 0v7m0-7L10 14m-7 7h7a2 2 0 002-2v-7" /></svg></span>
    </a>`;
  };

  marked.setOptions({
    renderer,
    breaks: true,
    gfm: true,
  });

  return marked(processedText);
};

const askQuestion = (question: string) => {
  userInput.value = question;
  sendMessage();
};

const showBotMessageProgressively = async (
  fullText: string,
  suggestions?: string[],
) => {
  // Découper en lignes (par \n ou double retour à la ligne)
  const lines = fullText.split(/(\n\n|\n)/g).filter((l) => l.trim() !== "");
  let displayed = "";
  const msg: Message = {
    text: fullText,
    isBot: true,
    suggestions,
    progressiveText: "",
  };
  messages.value.push(msg);
  for (let i = 0; i < lines.length; i++) {
    displayed += (i > 0 ? "\n" : "") + lines[i];
    msg.progressiveText = displayed;
    await nextTick();
    scrollToBottom();
    await new Promise((res) => setTimeout(res, 60)); // délai entre chaque ligne
  }
  // À la fin, on s'assure que tout le texte est bien affiché
  msg.progressiveText = fullText;
  await nextTick();
  scrollToBottom();
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
  scrollToBottom();

  try {
    const requestBody: ChatbotRequest = {
      question: question,
    };

    if (chatSessionId.value) {
      requestBody.chatSessionId = chatSessionId.value;
      requestBody.documentIds = [];
    }

    const { data, error } = await useFetch(`/api/chat`, {
      method: "POST",
      body: requestBody,
    });

    if (error.value) {
      throw new Error("Erreur lors de la communication avec le chatbot");
    }

    const dataTest: any = await data.value;

    if (dataTest.chatSessionId) {
      chatSessionId.value = dataTest.chatSessionId;
    }

    // Affichage progressif pour le bot
    await showBotMessageProgressively(
      dataTest.answer || "Désolé, je n'ai pas pu traiter votre demande.",
      dataTest.suggestingQuestions,
    );
  } catch (error) {
    messages.value.push({
      text: "Désolé, une erreur est survenue. Veuillez réessayer.",
      isBot: true,
    });
    console.error("Erreur:", error);
  } finally {
    isLoading.value = false;
    scrollToBottom();
    focusTextarea();
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollIntoView({ behavior: "smooth", block: "end" });
  }
};

const focusTextarea = () => {
  nextTick(() => {
    if (textareaRef.value) {
      (textareaRef.value as HTMLElement).focus();
    }
  });
};

watch(
  () => messages.value.length,
  () => {
    scrollToBottom();
  },
);

onMounted(() => {
  scrollToBottom();
  focusTextarea();
});
</script>

<style>
.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 0.75rem;
  color: inherit;
}

.prose p:last-child {
  margin-bottom: 0;
}

.prose a {
  text-decoration-thickness: 1px;
  color: #2563eb; /* Couleur bleue */
  text-decoration: underline;
  transition: color 0.2s ease;
}

.prose a:hover {
  color: #1d4ed8; /* Couleur bleue plus foncée au survol */
}

.prose pre {
  margin-bottom: 0.75rem;
}

.animate-in {
  animation: fadeSlideIn 0.4s ease-out forwards;
  opacity: 0;
  transform: translateY(8px);
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

/* Animation de transition pour les messages */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
