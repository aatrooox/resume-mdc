<script setup lang="ts">
const source = ref('')

const { pages, measuring, fullBody } = usePagination(computed(() => source.value))

onMounted(() => {
  source.value = localStorage.getItem('print_content') || ''
  localStorage.removeItem('print_content')
})

// Auto-print when pagination is ready
watch([measuring, pages], ([m, p]) => {
  if (!m && p.length > 0) {
    nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.print()
        })
      })
    })
  }
})

// Fallback: if no content renders after timeout, show error
const showError = ref(false)
watch([measuring, pages], ([m, p]) => {
  if (!m && p.length === 0 && source.value) {
    setTimeout(() => {
      if (pages.value.length === 0 && !measuring.value) {
        showError.value = true
      }
    }, 4000)
  }
})
</script>

<template>
  <div class="bg-white">
    <!-- Hidden measurement container -->
    <div
      v-if="measuring && fullBody"
      class="measure-container fixed top-0 left-0 -z-50"
      style="visibility: hidden; width: 794px; padding: 48px;"
    >
      <MDCRenderer :body="fullBody" tag="article" />
    </div>

    <!-- Print pages -->
    <div
      v-for="page in pages"
      :key="page.number"
      class="print-page"
    >
      <article>
        <MDCRenderer
          v-for="entry in page.entries"
          :key="entry.key"
          :body="{ type: 'root', children: [entry.ast] }"
        />
      </article>
    </div>

    <!-- Loading / Empty / Error states -->
    <div v-if="measuring && pages.length === 0" class="text-center py-20 text-foreground/30">
      正在准备打印...
    </div>
    <div v-else-if="showError" class="text-center py-20 text-foreground/30">
      内容加载失败，请返回编辑器重试
    </div>
    <div v-else-if="!measuring && pages.length === 0 && !source" class="text-center py-20 text-foreground/30">
      没有可打印的内容
    </div>
  </div>
</template>

<style>
.print-page {
  width: 794px;
  min-height: 1123px;
  padding: 48px;
  background: white;
  page-break-after: always;
  box-shadow: none;
  box-sizing: border-box;
}
.print-page:last-child {
  page-break-after: auto;
}

@media print {
  html, body {
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }

  @page {
    size: A4;
    margin: 0;
  }

  .measure-container {
    display: none !important;
  }
}
</style>
