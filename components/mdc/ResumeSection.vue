<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section class="mb-8">
    <h2 class="text-[16px] font-bold text-foreground tracking-widest uppercase border-b border-border pb-2 mb-5">
      {{ title }}
    </h2>
    <slot />
  </section>
</template>
