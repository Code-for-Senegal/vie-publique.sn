<template>
  <div class="flex h-dvh min-w-0 flex-col">
    <AiChatHeader title="Chat Statique" />
    <AiChatMessagesList ref="messagesListRef" />
    <div class="h-4" />
    <div class="mx-auto flex w-full gap-2 px-4 pb-4 md:max-w-3xl md:pb-4">
      <AiChatInputBox @submit="handleStaticSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "chat",
});
const messagesListRef = ref<{ addMessage: (message: string) => void } | null>(null)

const handleStaticSubmit = (message: string) => {
  if (messagesListRef.value) {
    messagesListRef.value.addMessage(message)
  }
}
</script>