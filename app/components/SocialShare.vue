<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  url?: string
}>()

const copied = ref(false)
const route = useRoute()
const config = useRuntimeConfig()

const currentUrl = computed(() => {
  if (props.url) return props.url
  if (import.meta.client) {
    return window.location.href
  }
  return `${config.public.siteUrl}${route.path}`
})

const shareLinks = computed(() => {
  const url = encodeURIComponent(currentUrl.value)
  const text = encodeURIComponent(props.title)

  return [
    {
      name: 'WhatsApp',
      icon: 'i-simple-icons-whatsapp',
      url: `https://wa.me/?text=${text}%20${url}`,
      color: 'hover:bg-[#25D366] hover:text-white',
      bg: 'bg-[#25D366]/10 text-[#25D366]',
    },
    {
      name: 'X (Twitter)',
      icon: 'i-simple-icons-x',
      url: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      color: 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
      bg: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',
    },
    {
      name: 'Facebook',
      icon: 'i-simple-icons-facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      color: 'hover:bg-[#1877F2] hover:text-white',
      bg: 'bg-[#1877F2]/10 text-[#1877F2]',
    },
    {
      name: 'LinkedIn',
      icon: 'i-simple-icons-linkedin',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      color: 'hover:bg-[#0A66C2] hover:text-white',
      bg: 'bg-[#0A66C2]/10 text-[#0A66C2]',
    },
  ]
})

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(currentUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Partager ce document</p>

    <div class="flex flex-wrap gap-2">
      <a
        v-for="link in shareLinks"
        :key="link.name"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
        :class="[link.bg, link.color]"
        :aria-label="`Partager sur ${link.name}`"
        :title="`Partager sur ${link.name}`"
      >
        <UIcon :name="link.icon" class="h-5 w-5" />
      </a>

      <button
        @click="copyLink"
        class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        aria-label="Copier le lien"
        title="Copier le lien"
      >
        <UIcon
          :name="copied ? 'i-heroicons-check' : 'i-heroicons-link'"
          class="h-5 w-5"
          :class="{ 'text-green-600 dark:text-green-400': copied }"
        />
      </button>
    </div>
  </div>
</template>
