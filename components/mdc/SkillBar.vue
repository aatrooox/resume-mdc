<script setup lang="ts">
defineProps<{
  skill: string
  level: number
}>()
</script>

<template>
  <div class="mb-3">
    <div class="flex justify-between text-[13px] mb-1.5">
      <span class="font-medium text-foreground">{{ skill }}</span>
      <span class="text-foreground/50">{{ level }}%</span>
    </div>
    <div class="h-1.5 bg-muted">
      <div class="h-full bg-foreground transition-all duration-500" :style="{ width: `${level}%` }" />
    </div>
  </div>
</template>
