<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  items: string
}>()

const tags = computed(() =>
  props.items.split(',').map(s => s.trim()).filter(Boolean)
)
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <span
      v-for="tag in tags"
      :key="tag"
      class="text-[13px] text-foreground/70 bg-muted px-3 py-1"
    >
      {{ tag }}
    </span>
  </div>
</template>
