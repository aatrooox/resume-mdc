<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  date?: string
}>()
</script>

<template>
  <div class="mb-5">
    <div class="flex justify-between items-baseline mb-2">
      <h3 class="text-[15px] font-bold text-foreground">{{ title }}</h3>
      <span v-if="date" class="text-[13px] text-foreground/50 shrink-0 ml-4">{{ date }}</span>
    </div>
    <p v-if="subtitle" class="text-[13px] text-foreground/50 mb-2">{{ subtitle }}</p>
    <div class="text-[14px] text-foreground/70 leading-relaxed space-y-1">
      <slot />
    </div>
  </div>
</template>
