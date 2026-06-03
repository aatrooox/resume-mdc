<script setup lang="ts">
const content = ref('')

onMounted(() => {
  content.value = localStorage.getItem('print_content') || ''
  nextTick(() => {
    window.print()
  })
})
</script>

<template>
  <div class="bg-white p-0">
    <MDCRenderer v-if="content" :value="content" tag="article" class="max-w-[794px] mx-auto p-12" />
    <div v-else class="text-center py-20 text-foreground/30">No content</div>
  </div>
</template>

<style>
@media print {
  body { margin: 0; padding: 0; }
  @page { size: A4; margin: 0; }
}
</style>
