<script setup lang="ts">
const props = defineProps<{ content: string }>()
</script>

<template>
  <div class="bg-white max-w-[794px] mx-auto p-12 min-h-[1123px]" style="box-shadow: 0 0 0 1px #E4E7EB;">
    <MDCRenderer v-if="content" :value="content" tag="article" />
    <div v-else class="text-foreground/30 text-center mt-32 text-[15px]">
      在左侧编辑 Markdown 内容，这里将实时显示预览
    </div>
  </div>
</template>
