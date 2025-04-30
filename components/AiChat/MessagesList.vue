<template>
  <ScrollAreaRoot class="relative flex min-w-0 flex-1 overflow-hidden">
    <ScrollAreaViewport ref="chatContainer" class="h-full w-full">
      <ul class="flex flex-col-reverse pt-4">
        <li
          v-for="message in messages"
          :key="message.id"
          class="mx-auto w-full max-w-3xl px-4 [&:first-child[data-role='assistant']_.action-buttons]:!opacity-100"
          :data-role="message.role"
        >
          <AiChatMessageBubble :message="message" :preview="preview" />
        </li>
      </ul>
    </ScrollAreaViewport>
    <ScrollAreaScrollbar
      class="z-20 flex touch-none rounded-full p-0.5 select-none hover:bg-neutral-200 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-2.5 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      orientation="vertical"
    >
      <ScrollAreaThumb
        class="relative flex-1 rounded-[10px] bg-neutral-400 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] dark:bg-neutral-600"
      />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>

<script setup lang="ts">
import {
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from 'reka-ui'
import { ref, watch, onMounted, nextTick } from 'vue'

defineProps<{
  preview?: boolean
}>()

// Liste initiale de messages statiques
const messages = ref([
  {
    id: '1',
    role: 'user',
    content: 'Bonjour, comment puis-je utiliser Nuxt.js ?',
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Nuxt.js est un framework basé sur Vue.js qui simplifie la création d’applications web performantes. Voici quelques étapes pour commencer : \n1. **Installation** : Créez un projet avec `npx create-nuxt-app`. \n2. **Structure** : Organisez vos pages dans le dossier `pages/`. \n3. **Composants** : Utilisez des composants réutilisables dans `components/`. \n4. **Statique ou SSR** : Choisissez entre génération statique ou rendu côté serveur. \nConsultez la documentation officielle pour plus de détails !',
  },
])

// Méthode pour ajouter un message et une réponse simulée
const addMessage = (userMessage: string) => {
  const userMessageId = `${Date.now()}-${Math.random()}` // ID unique
  messages.value.push({
    id: userMessageId,
    role: 'user',
    content: userMessage,
  })

  // Réponse simulée
  const responseId = `${Date.now()}-${Math.random()}`
  const simulatedResponse = getSimulatedResponse(userMessage)
  messages.value.push({
    id: responseId,
    role: 'assistant',
    content: simulatedResponse,
  })
}

// Fonction pour générer une réponse simulée
const getSimulatedResponse = (userMessage: string) => {
  // Vous pouvez personnaliser cette logique
  const responses = [
    'Merci pour votre question ! Voici une réponse générique.',
    'C’est intéressant ! Pouvez-vous préciser ?',
    'Je ne suis qu’une simulation, mais voici une réponse : tout va bien !',
    `Vous avez dit : "${userMessage}". Je réponds : Cool !`,
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

const chatContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// Surveiller les changements dans les messages pour défiler vers le bas
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  scrollToBottom()
})

// Exposer la méthode addMessage pour le parent
defineExpose({
  addMessage,
})
</script>