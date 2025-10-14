<template>
  <form
    class="relative flex w-full flex-col gap-4"
    @submit.prevent="handleSubmit"
  >
    <UTextarea
      ref="textareaRef"
      v-model="inputValue"
      placeholder="Ask me anything..."
      color="primary"
      variant="subtle"
      class="w-full"
      :rows="3"
      :max-rows="12"
      size="xl"
      :autoresize="true"
      :ui="{
        base: 'rounded-3xl resize-none pb-12 px-4 pt-4 md:text-sm',
      }"
      @keydown.enter.prevent="handleKeyDown"
    />
    <div class="absolute right-3 bottom-3 flex items-center gap-2">
      <UButton
        type="submit"
        color="primary"
        variant="solid"
        size="sm"
        icon="i-lucide-arrow-up"
        class="rounded-full transition-opacity"
        :disabled="!inputValue"
        :ui="{ base: 'disabled:opacity-20' }"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
const inputValue = ref('')

const emit = defineEmits<{
  (e: 'submit', value: string): void
}>()

const handleSubmit = () => {
  if (!inputValue.value) return
  emit('submit', inputValue.value)
  inputValue.value = ''
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.shiftKey) return
  handleSubmit()
}

const setMessage = (message: string) => {
  inputValue.value = message
}

defineExpose({
  setMessage,
})
</script>