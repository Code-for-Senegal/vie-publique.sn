<template>
  <NuxtImg
    v-if="src"
    :provider="provider"
    :src="imageSrc"
    :alt="alt"
    :width="width"
    :height="height"
    :sizes="sizes"
    :loading="loading"
    :class="imageClass"
    :placeholder="placeholder"
    :quality="quality"
    :fetchpriority="fetchPriority"
    @error="handleError"
  />
  <img
    v-else
    :src="fallbackSrc"
    :alt="alt"
    :class="imageClass"
    :loading="loading"
  />
</template>

<script setup lang="ts">
interface Props {
  src?: string | null;
  alt?: string;
  width?: number | string;
  height?: number | string;
  sizes?: string;
  loading?: "lazy" | "eager";
  fetchpriority?: "high" | "low" | "auto";
  class?: string;
  placeholder?: string | number[] | boolean;
  quality?: number;
  fallback?: string;
  useProxy?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  alt: "Image",
  loading: "lazy",
  fetchpriority: undefined,
  fallback: "/default-image-2.gif",
  useProxy: true,
  quality: 80,
});

// Déterminer si on utilise le proxy ou l'URL directe
const provider = computed(() => {
  // Si useProxy est false ou si l'URL est déjà complète, utiliser le provider par défaut
  if (!props.useProxy || props.src?.startsWith("http")) {
    return undefined;
  }
  // Sinon utiliser notre provider CMS
  return "cms";
});

// Transformer le src si nécessaire
const imageSrc = computed(() => {
  if (!props.src) return "";

  // Si c'est déjà une URL du proxy
  if (props.src.startsWith("/api/cms-images/")) {
    // Ajouter la qualité si elle est spécifiée
    if (props.quality) {
      return `${props.src}?quality=${props.quality}`;
    }
    return props.src;
  }

  // Si useProxy est activé et ce n'est pas une URL complète
  if (props.useProxy && !props.src.startsWith("http")) {
    // Pour les images CMS, ajouter la qualité dans l'URL
    if (props.quality) {
      return `${props.src}?quality=${props.quality}`;
    }
    return props.src;
  }

  return props.src;
});

const imageClass = computed(() => props.class);
const fallbackSrc = computed(() => props.fallback);

// Déterminer fetchPriority automatiquement
const fetchPriority = computed(() => {
  // Si défini explicitement, l'utiliser
  if (props.fetchpriority) {
    return props.fetchpriority;
  }
  
  // Si loading="eager", alors fetchPriority="high"
  if (props.loading === "eager") {
    return "high";
  }
  
  // Par défaut, pas de fetchPriority pour lazy loading
  return undefined;
});

// Gestion des erreurs de chargement
const handleError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img && props.fallback) {
    img.src = props.fallback;
  }
};
</script>
