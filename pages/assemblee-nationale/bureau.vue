<script setup lang="ts">
const { office, loading, error } = useAssemblyOffice();
const router = useRouter();

interface OfficeGroup {
  name: string;
  members: any[];
  columns: string;
  count: number; // Nombre de skeletons à afficher
}

// Configuration des groupes pour le skeleton et l'affichage réel
const groupsConfig = [
  {
    name: "Président",
    role: "president",
    columns: "max-w-xs mx-auto",
    count: 1,
  },
  {
    name: "Vice-présidents",
    role: "vice_president",
    columns: "grid-cols-2 md:grid-cols-4",
    count: 8,
  },
  {
    name: "Secrétaires",
    role: "secretary",
    columns: "grid-cols-2 md:grid-cols-3",
    count: 6,
  },
  {
    name: "Questeurs",
    role: "quaestor",
    columns: "grid-cols-2 max-w-2xl mx-auto",
    count: 2,
  },
];

const groupedMembers = computed<OfficeGroup[]>(() => {
  if (!office.value) return [];

  const groups: OfficeGroup[] = [];

  groupsConfig.forEach((config) => {
    const members =
      config.role === "president"
        ? office.value.find((member) => member.role === config.role)?.deputy
          ? [office.value.find((member) => member.role === config.role)!.deputy]
          : []
        : office.value
            .filter((member) => member.role === config.role)
            .sort((a, b) => (a.rank || 0) - (b.rank || 0))
            .map((member) => member.deputy);

    if (members.length) {
      groups.push({
        name: config.name,
        members,
        columns: config.columns,
        count: config.count,
      });
    }
  });

  return groups;
});
</script>

<template>
  <div class="container mx-auto px-4 py-4">
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="15e législature"
      color="gray"
      @click.native="router.back()"
    />
    <div class="mx-auto max-w-7xl">
      <h1 class="mb- text-center text-2xl font-bold md:text-3xl">
        Bureau de l'Assemblée nationale
      </h1>

      <!-- Loading state with skeletons -->
      <div v-if="loading" class="space-y-12">
        <section v-for="group in groupsConfig" :key="group.name">
          <h2 class="mb-4 text-center text-xl font-semibold">
            {{ group.name }}
          </h2>
          <div :class="['grid gap-6', group.columns]">
            <AssemblyDeputyCardSkeleton v-for="n in group.count" :key="n" />
          </div>
        </section>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="py-8 text-center text-red-500">
        {{ error }}
      </div>

      <!-- Content -->
      <div v-else class="space-y-8">
        <section v-for="group in groupedMembers" :key="group.name">
          <h2 class="mb-4 text-center text-xl font-semibold">
            {{ group.name }}
          </h2>
          <div :class="['grid gap-6', group.columns]">
            <AssemblyDeputyCard
              v-for="deputy in group.members"
              :key="deputy.id"
              :deputy="deputy"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
