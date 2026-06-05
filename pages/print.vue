<script setup lang="ts">
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

const body = ref<any>(null)

onMounted(async () => {
  const raw = localStorage.getItem('print_content') || ''
  if (raw) {
    try {
      const result = await parseMarkdown(raw)
      body.value = result.body
    } catch { /* ignore parse errors */ }
  }

  // Wait for MDC custom elements to fully render before printing
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  await new Promise(resolve => setTimeout(resolve, 400))

  await nextTick()
  window.print()
})
</script>

<template>
  <div class="bg-white p-0">
    <MDCRenderer v-if="body" :body="body" tag="article" class="max-w-[794px] mx-auto p-12" />
    <div v-else class="text-center py-20 text-foreground/30">加载中...</div>
  </div>
</template>

<style>
@media print {
  body { margin: 0; padding: 0; }
  @page { size: A4; margin: 0; }
}
</style>
