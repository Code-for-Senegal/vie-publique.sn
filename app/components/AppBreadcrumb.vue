<template>
  <div class="pt-3 pb-1">
    <!-- Mobile: Back link (navigation parent, UX native app) -->
    <nav
      class="flex items-center min-h-[44px] md:hidden"
      aria-label="Breadcrumb"
    >
      <ULink
        :to="parentItem?.to || '/'"
        class="inline-flex items-center gap-1.5 py-2 pr-3 text-sm text-gray-600 active:text-gray-900 transition-colors dark:text-gray-400 dark:active:text-gray-100"
      >
        <UIcon
          name="i-heroicons-chevron-left"
          class="size-4 flex-shrink-0"
        />
        <span class="truncate max-w-[200px]">
          {{ parentItem?.label || "Accueil" }}
        </span>
      </ULink>
    </nav>

    <!-- Desktop: Full breadcrumb trail -->
    <nav class="hidden md:block" aria-label="Breadcrumb">
      <ol class="flex items-center gap-1 text-sm">
        <!-- Accueil (icône) -->
        <li>
          <ULink
            to="/"
            class="inline-flex items-center justify-center p-1 text-gray-400 hover:text-gray-600 rounded transition-colors dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="Accueil"
          >
            <UIcon name="i-heroicons-home" class="size-4" />
          </ULink>
        </li>

        <!-- Items -->
        <li
          v-for="(item, index) in resolvedItems"
          :key="index"
          class="flex items-center gap-1"
        >
          <UIcon
            name="i-heroicons-chevron-right"
            class="size-3.5 text-gray-300 flex-shrink-0 dark:text-gray-600"
          />

          <ULink
            v-if="item.to && index < resolvedItems.length - 1"
            :to="item.to"
            class="text-gray-500 hover:text-gray-700 transition-colors truncate max-w-[200px] dark:text-gray-400 dark:hover:text-gray-200"
            :title="item.label"
          >
            {{ item.label }}
          </ULink>

          <span
            v-else
            class="text-gray-900 font-medium truncate max-w-[250px] dark:text-white"
            :title="item.label"
            aria-current="page"
          >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
  </div>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface Props {
  /** New API: all breadcrumb items including current page as last */
  items?: BreadcrumbItem[];
  /** Legacy API: intermediate links (backward compat) */
  links?: BreadcrumbItem[];
  /** Legacy API: current page label (backward compat) */
  lastText?: string | string[];
}

const props = defineProps<Props>();

// Resolve items: support both new (items) and legacy (links + lastText) API
const resolvedItems = computed<BreadcrumbItem[]>(() => {
  if (props.items?.length) {
    return props.items;
  }

  // Legacy compatibility: reconstruct items from links + lastText
  const result: BreadcrumbItem[] = [...(props.links || [])];
  if (props.lastText) {
    const label = Array.isArray(props.lastText)
      ? props.lastText.join(" / ")
      : props.lastText;
    result.push({ label });
  }
  return result;
});

// Mobile: parent item (avant-dernier) ou null → fallback Accueil
const parentItem = computed<BreadcrumbItem | null>(() => {
  if (resolvedItems.value.length >= 2) {
    return resolvedItems.value[resolvedItems.value.length - 2];
  }
  if (resolvedItems.value.length === 1 && resolvedItems.value[0].to) {
    return resolvedItems.value[0];
  }
  return null;
});

// SEO: structured data via @nuxtjs/seo
const runtimeConfig = useRuntimeConfig();
const baseUrl = (runtimeConfig.public?.siteUrl as string) || "";

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: () => [
      { name: "Accueil", item: baseUrl || "/" },
      ...resolvedItems.value.map((item) => ({
        name: item.label,
        ...(item.to ? { item: `${baseUrl}${item.to}` } : {}),
      })),
    ],
  }),
]);
</script>
