<script setup lang="ts">
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

const props = defineProps<{ content: string }>()

const source = computed(() => props.content)
const { pages, measuring, fullBody } = usePagination(source)

// Mirror the composable's measurement container visibility for the template
const showMeasure = computed(() => measuring.value && fullBody.value)
</script>

<template>
  <ClientOnly>
    <div class="flex flex-col items-center gap-8">
      <!-- Hidden measurement container -->
      <div
        v-if="showMeasure"
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
        <article>
          <template v-for="entry in page.entries" :key="entry.key">
            <!-- Clipped top portion -->
            <div v-if="entry.clip?.type === 'top'" :style="{ overflow: 'hidden', maxHeight: entry.clip.maxHeight + 'px' }">
              <MDCRenderer :body="{ type: 'root', children: [entry.ast] }" />
            </div>
            <!-- Clipped bottom continuation -->
            <div v-else-if="entry.clip?.type === 'bottom'" :style="{ overflow: 'hidden', height: entry.clip.visibleHeight + 'px' }">
              <div :style="{ marginTop: '-' + entry.clip.offset + 'px' }">
                <MDCRenderer :body="{ type: 'root', children: [entry.ast] }" />
              </div>
            </div>
            <!-- Normal unsplit entry -->
            <MDCRenderer v-else :body="{ type: 'root', children: [entry.ast] }" />
          </template>
        </article>
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
