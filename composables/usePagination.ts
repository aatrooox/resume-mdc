import { parseMarkdown } from '@nuxtjs/mdc/runtime'

export interface ClipTop {
  type: 'top'
  maxHeight: number
}

export interface ClipBottom {
  type: 'bottom'
  offset: number
  visibleHeight: number
}

export type ClipInfo = ClipTop | ClipBottom

export interface PageEntry {
  ast: any
  key: string
  clip?: ClipInfo
}

export interface PageGroup {
  number: number
  entries: PageEntry[]
}

const PAGE_HEIGHT = 1123   // A4 at 794px width, 96dpi
const PAD = 48 * 2         // p-12 top + bottom
const CONTENT = PAGE_HEIGHT - PAD

export function usePagination(source: ComputedRef<string>) {
  const pages = ref<PageGroup[]>([])
  const measuring = ref(false)
  const fullBody = ref<any>(null)

  watch(source, async (newContent) => {
    if (!newContent) { fullBody.value = null; pages.value = []; return }
    try {
      const result = await parseMarkdown(newContent)
      fullBody.value = result.body
    } catch {
      // keep last valid render
    }
  }, { immediate: true })

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
          const pageGroups: PageGroup[] = []
          let currentEntries: PageEntry[] = []
          let accum = 0

          for (let i = 0; i < children.length; i++) {
            const h = children[i].getBoundingClientRect().height

            if (accum + h > CONTENT && currentEntries.length > 0) {
              const remaining = CONTENT - accum
              if (remaining > 0) {
                // Split: top portion stays on current page
                currentEntries.push({ ast: sourceChildren[i], key: `${i}-top`, clip: { type: 'top', maxHeight: remaining } })
                // Bottom portion starts the next page
                pageGroups.push({ number: pageGroups.length + 1, entries: [...currentEntries] })
                currentEntries = [{ ast: sourceChildren[i], key: `${i}-bottom`, clip: { type: 'bottom', offset: remaining, visibleHeight: h - remaining } }]
                accum = h - remaining
              } else {
                // No room left, entire child goes to next page
                pageGroups.push({ number: pageGroups.length + 1, entries: [...currentEntries] })
                currentEntries = [{ ast: sourceChildren[i], key: `${i}` }]
                accum = h
              }
            } else {
              currentEntries.push({ ast: sourceChildren[i], key: `${i}` })
              accum += h
            }
          }
          if (currentEntries.length > 0) {
            pageGroups.push({ number: pageGroups.length + 1, entries: currentEntries })
          }

          pages.value = pageGroups
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

  return { pages, measuring, fullBody }
}
