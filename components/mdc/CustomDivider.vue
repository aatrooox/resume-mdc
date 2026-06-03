<script setup lang="ts">
defineProps<{
  space?: number
}>()
</script>

<template>
  <hr class="border-border my-6" :style="space ? { marginTop: `${space}px`, marginBottom: `${space}px` } : {}" />
</template>
