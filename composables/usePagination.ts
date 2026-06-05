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
const MAX_RETRIES = 8

export function usePagination(source: ComputedRef<string>) {
  const pages = ref<PageGroup[]>([])
  const measuring = ref(false)
  const fullBody = ref<any>(null)
  const mounted = ref(false)

  onMounted(() => { mounted.value = true })

  watch(source, async (newContent) => {
    if (!newContent) { fullBody.value = null; pages.value = []; return }
    try {
      const result = await parseMarkdown(newContent)
      fullBody.value = result.body
    } catch {
      // keep last valid render
    }
  }, { immediate: true })

  function doMeasure(body: any, retries = 0) {
    measuring.value = true

    const article = document.querySelector('.measure-container article') as HTMLElement
    if (!article || article.children.length === 0) {
      if (retries < MAX_RETRIES) {
        // Measurement container not ready yet — retry with increasing delay
        const delay = 50 + retries * 60
        setTimeout(() => doMeasure(body, retries + 1), delay)
        return
      }
      measuring.value = false
      return
    }

    const children = Array.from(article.children) as HTMLElement[]
    const sourceChildren = body.children as any[]
    const pageGroups: PageGroup[] = []
    let currentEntries: PageEntry[] = []
    let accum = 0

    for (let i = 0; i < children.length; i++) {
      const h = children[i].getBoundingClientRect().height

      if (accum + h > CONTENT && currentEntries.length > 0) {
        const remaining = CONTENT - accum
        if (remaining > 0) {
          currentEntries.push({ ast: sourceChildren[i], key: `${i}-top`, clip: { type: 'top', maxHeight: remaining } })
          pageGroups.push({ number: pageGroups.length + 1, entries: [...currentEntries] })
          currentEntries = [{ ast: sourceChildren[i], key: `${i}-bottom`, clip: { type: 'bottom', offset: remaining, visibleHeight: h - remaining } }]
          accum = h - remaining
        } else {
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
  }

  // Trigger measurement when body changes (with retry for timing)
  watch(fullBody, (body) => {
    if (!body) { pages.value = []; return }
    nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          doMeasure(body)
        })
      })
    })
  })

  // Safety: re-trigger on mount in case initial measurement raced with ClientOnly hydration
  onMounted(() => {
    nextTick(() => {
      if (fullBody.value && pages.value.length === 0) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            doMeasure(fullBody.value)
          })
        })
      }
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
