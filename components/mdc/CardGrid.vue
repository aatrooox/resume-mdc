<script setup lang="ts">
defineProps<{
  cols?: number
}>()
</script>

<template>
  <div class="grid gap-4 my-4" :style="{ gridTemplateColumns: `repeat(${cols || 2}, 1fr)` }">
    <slot />
  </div>
</template>
