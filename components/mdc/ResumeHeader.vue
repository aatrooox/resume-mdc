<script setup lang="ts">
defineProps<{
  name: string
  title: string
  email?: string
  phone?: string
}>()
</script>

<template>
  <div class="border-b-2 border-foreground pb-6 mb-8">
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-[28px] font-bold text-foreground tracking-tight">{{ name }}</h1>
        <p class="text-[15px] text-foreground/60 mt-1 font-medium">{{ title }}</p>
      </div>
      <div v-if="email || phone" class="text-right text-[13px] text-foreground/60 space-y-0.5">
        <div v-if="email">{{ email }}</div>
        <div v-if="phone">{{ phone }}</div>
      </div>
    </div>
  </div>
</template>
