<template>
  <AppContainer title="Ai Chatbot" class="flex h-dvh min-h-screen min-w-0 flex-col bg-primary-50 pb-16 dark:bg-neutral-900">
    <AppBreadcrumb
      :items="[
        { label: 'Chat Bot' }
      ]"
    />

    <section class="py-12 sm:py-16 lg:py-32">
      <div class="mx-auto max-w-2xl">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold">Bonjour, Utilisateur</h1>
          <p class="text-2xl">Comment puis-je aider ?</p>
        </div>
        <AiChatMessagesList ref="messagesListRef" />
        <AiChatInputBox ref="inputBoxRef" @submit="handleStaticSubmit" />
        <div class="mt-8">
          <AiChatStarterMessages @on-select="handleStarterMessageSelect" />
        </div>
      </div>
    </section>
  </AppContainer>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "chat",
});

interface InputBoxExpose {
  setMessage: (message: string) => void
}

const inputBoxRef = ref<InputBoxExpose | null>(null)
const messagesListRef = ref<{ addMessage: (message: string) => void } | null>(null)

const handleStarterMessageSelect = (message: string) => {
  inputBoxRef.value?.setMessage(message)
}

const handleStaticSubmit = (message: string) => {
  if (messagesListRef.value) {
    messagesListRef.value.addMessage(message)
  }
}
</script>