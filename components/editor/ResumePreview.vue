<script setup lang="ts">
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

const props = defineProps<{ content: string }>()

const fullBody = ref<any>(null)
const pages = ref<{ body: any; number: number }[]>([])
const measuring = ref(false)

const PAGE_HEIGHT = 1123   // A4 at 794px width, 96dpi
const PAD = 48 * 2         // p-12 top + bottom
const CONTENT = PAGE_HEIGHT - PAD

watch(() => props.content, async (newContent) => {
  if (!newContent) { fullBody.value = null; pages.value = []; return }
  try {
    const result = await parseMarkdown(newContent)
    fullBody.value = result.body
  } catch {
    // keep last valid render
  }
}, { immediate: true })

// After fullBody is set and rendered in the measurement container, split into pages
watch(fullBody, (body) => {
  if (!body) { pages.value = []; return }
  measuring.value = true
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const article = document.querySelector('.measure-container article') as HTMLElement
        if (!article) { measuring.value = false; return }

        const children = Array.from(article.children) as HTMLElement[]
        if (children.length === 0) { measuring.value = false; return }

        const sourceChildren = body.children as any[]
        const pageGroups: any[][] = []
        let currentGroup: any[] = []
        let accum = 0

        for (let i = 0; i < children.length; i++) {
          const h = children[i].getBoundingClientRect().height
          if (accum + h > CONTENT && currentGroup.length > 0) {
            pageGroups.push(currentGroup)
            currentGroup = []
            accum = 0
          }
          currentGroup.push(sourceChildren[i])
          accum += h
        }
        if (currentGroup.length > 0) pageGroups.push(currentGroup)

        pages.value = pageGroups.map((group, idx) => ({
          body: { ...body, children: group },
          number: idx + 1,
        }))
        measuring.value = false
      })
    })
  })
})

let resizeTimer: ReturnType<typeof setTimeout> | null = null
onMounted(() => {
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      // re-trigger measurement by toggling
      if (fullBody.value) {
        const b = fullBody.value
        fullBody.value = null
        nextTick(() => { fullBody.value = b })
      }
    }, 200)
  })
})

onBeforeUnmount(() => {
  if (resizeTimer) clearTimeout(resizeTimer)
})
</script>

<template>
  <ClientOnly>
    <div class="flex flex-col items-center gap-8">
      <!-- Hidden measurement container -->
      <div
        v-if="measuring && fullBody"
        class="measure-container fixed top-0 left-0 -z-50"
        style="visibility: hidden; width: 794px; padding: 48px;"
      >
        <MDCRenderer :body="fullBody" tag="article" />
      </div>

      <!-- Visible pages -->
      <div
        v-for="page in pages"
        :key="page.number"
        class="resume-page bg-white w-[794px] max-w-full p-8 md:p-12"
        style="box-shadow: 0 0 0 1px #E4E7EB;"
      >
        <MDCRenderer :body="page.body" tag="article" />
        <div
          v-if="pages.length > 1"
          class="text-foreground/15 text-center mt-8 text-[12px] select-none"
        >
          第 {{ page.number }} 页 / 共 {{ pages.length }} 页
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!measuring && pages.length === 0"
        class="bg-white w-[794px] max-w-full p-8 md:p-12"
        style="box-shadow: 0 0 0 1px #E4E7EB; aspect-ratio: 794 / 1123;"
      >
        <div class="text-foreground/30 text-center mt-32 text-[15px]">
          <template v-if="fullBody">
            内容加载中...
          </template>
          <template v-else>
            在左侧编辑 Markdown 内容，这里将实时显示预览
          </template>
        </div>
      </div>
    </div>

    <template #fallback>
      <div class="bg-white w-[794px] max-w-full mx-auto p-8 md:p-12" style="box-shadow: 0 0 0 1px #E4E7EB; aspect-ratio: 794 / 1123;">
        <div class="text-foreground/30 text-center mt-32 text-[15px]">加载中...</div>
      </div>
    </template>
  </ClientOnly>
</template>
