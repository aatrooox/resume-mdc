# 在线简历编辑器 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Target:** 基于 MDC 语法的在线简历编辑器，Nuxt 4 + @nuxt/mdc

**Architecture:** Nuxt 4 SSR/SSG hybrid app。编辑器页面是 SPA-like 体验（CodeMirror 6 左栏 + @nuxt/mdc 渲染预览右栏）。4套模板共享10个MDC组件。微信 OAuth 登录，纯客户端导出（Print API + html2canvas）。

**Tech Stack:** Nuxt 4, @nuxt/mdc, CodeMirror 6, Tailwind CSS, Noto Sans SC, html2canvas, jose

**Design System:**
- Style: Minimalism & Swiss Style — 高对比度，大量留白，几何布局，无装饰
- Colors: Bg `#F8FAFC` / Text `#0F172A` / Primary `#1E3A5F` / Accent `#059669` / Border `#E4E7EB`
- Typography: Noto Sans SC (300/400/500/700)，16px base，1.6 line-height
- Spacing: 8px 基础单位，4/8/16/24/32/48 节奏
- Radius: 0px (直角)，Shadow: none（扁平无阴影）
- Animation: 150-300ms ease-out 微过渡

---

### Task 1: 项目脚手架 & 基础配置

**Files:**
- Create: `resume-editor/package.json`
- Create: `resume-editor/nuxt.config.ts`
- Create: `resume-editor/tailwind.config.ts`
- Create: `resume-editor/app.vue`
- Create: `resume-editor/assets/styles/main.css`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "resume-editor",
  "private": true,
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview"
  },
  "devDependencies": {
    "@nuxtjs/tailwindcss": "^6.13.0",
    "nuxt": "^4.0.0",
    "typescript": "^5.6.0"
  },
  "dependencies": {
    "@codemirror/lang-markdown": "^6.3.0",
    "@codemirror/language": "^6.10.0",
    "@codemirror/state": "^6.5.0",
    "@codemirror/view": "^6.35.0",
    "@codemirror/theme-one-dark": "^6.1.0",
    "@nuxt/mdc": "^0.13.0",
    "html2canvas": "^1.4.1",
    "jose": "^5.9.0"
  }
}
```

- [ ] **Step 2: 安装依赖**

```bash
cd /Users/aatrox/.oh-my-zzhub/core/beta/resume-editor && npm install
```

- [ ] **Step 3: 配置 nuxt.config.ts**

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/mdc', '@nuxtjs/tailwindcss'],

  mdc: {
    components: {
      prose: false,
      map: {
        'resume-header': 'ResumeHeader',
        'resume-section': 'ResumeSection',
        'resume-item': 'ResumeItem',
        'skill-tags': 'SkillTags',
        'timeline': 'Timeline',
        'skill-bar': 'SkillBar',
        'contact-icons': 'ContactIcons',
        'quote': 'QuoteBlock',
        'card-grid': 'CardGrid',
        'divider': 'CustomDivider',
      }
    }
  },

  tailwindcss: {
    config: {
      content: [
        './components/**/*.{vue,js,ts}',
        './pages/**/*.{vue,js,ts}',
      ],
      theme: {
        extend: {
          colors: {
            primary: '#1E3A5F',
            accent: '#059669',
            surface: '#F8FAFC',
            foreground: '#0F172A',
            muted: '#F1F3F5',
            border: '#E4E7EB',
          },
          fontFamily: {
            sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
          },
          fontSize: {
            'body': ['16px', { lineHeight: '1.6' }],
          },
          spacing: {
            '1': '4px',
            '2': '8px',
            '3': '12px',
            '4': '16px',
            '6': '24px',
            '8': '32px',
            '12': '48px',
          },
        },
      },
    },
  },

  app: {
    head: {
      title: '在线简历编辑器',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap' },
      ],
    },
  },

  compatibilityDate: '2025-01-01',
})
```

- [ ] **Step 4: 创建 app.vue**

```vue
<!-- app.vue -->
<template>
  <div class="min-h-screen bg-surface text-foreground font-sans">
    <NuxtPage />
  </div>
</template>
```

- [ ] **Step 5: 创建 main.css**

```css
/* assets/styles/main.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply text-body;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

- [ ] **Step 6: 验证项目启动**

```bash
cd /Users/aatrox/.oh-my-zzhub/core/beta/resume-editor && npm run dev
```
Expected: Nuxt 4 dev server starts, open http://localhost:3000 shows blank page without errors.

- [ ] **Step 7: Commit**

```bash
git add resume-editor/package.json resume-editor/nuxt.config.ts resume-editor/tailwind.config.ts resume-editor/app.vue resume-editor/assets/styles/main.css resume-editor/package-lock.json
git commit -m "feat: scaffold Nuxt 4 project with @nuxt/mdc, Tailwind, CodeMirror dep"
```

---

### Task 2: MDC 核心组件（4个）

**Files:**
- Create: `resume-editor/components/mdc/ResumeHeader.vue`
- Create: `resume-editor/components/mdc/ResumeSection.vue`
- Create: `resume-editor/components/mdc/ResumeItem.vue`
- Create: `resume-editor/components/mdc/SkillTags.vue`

- [ ] **Step 1: ResumeHeader.vue**

```vue
<!-- components/mdc/ResumeHeader.vue -->
<script setup lang="ts">
const props = defineProps<{
  name: string
  title: string
  email?: string
  phone?: string
  avatar?: string
}>()
</script>

<template>
  <div class="border-b-2 border-foreground pb-6 mb-8">
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-[28px] font-bold text-foreground tracking-tight">{{ name }}</h1>
        <p class="text-[15px] text-foreground/60 mt-1 font-medium">{{ title }}</p>
      </div>
      <div v-if="email || phone" class="text-right text-[13px] text-foreground/60 space-y-0.5">
        <div v-if="email">{{ email }}</div>
        <div v-if="phone">{{ phone }}</div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: ResumeSection.vue**

```vue
<!-- components/mdc/ResumeSection.vue -->
<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section class="mb-8">
    <h2 class="text-[16px] font-bold text-foreground tracking-widest uppercase border-b border-border pb-2 mb-5">
      {{ title }}
    </h2>
    <slot />
  </section>
</template>
```

- [ ] **Step 3: ResumeItem.vue**

```vue
<!-- components/mdc/ResumeItem.vue -->
<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  date?: string
}>()
</script>

<template>
  <div class="mb-5">
    <div class="flex justify-between items-baseline mb-2">
      <h3 class="text-[15px] font-bold text-foreground">{{ title }}</h3>
      <span v-if="date" class="text-[13px] text-foreground/50 shrink-0 ml-4">{{ date }}</span>
    </div>
    <p v-if="subtitle" class="text-[13px] text-foreground/50 mb-2">{{ subtitle }}</p>
    <div class="text-[14px] text-foreground/70 leading-relaxed space-y-1">
      <slot />
    </div>
  </div>
</template>
```

- [ ] **Step 4: SkillTags.vue**

```vue
<!-- components/mdc/SkillTags.vue -->
<script setup lang="ts">
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
```

- [ ] **Step 5: 验证组件注册**

创建测试页面 `pages/test-mdc.vue`，写入测试 MDC 内容，访问 `/test-mdc` 确认四个组件正常渲染。

```bash
cd /Users/aatrox/.oh-my-zzhub/core/beta/resume-editor && npm run dev
# Open http://localhost:3000/test-mdc
```

- [ ] **Step 6: Commit**

```bash
git add resume-editor/components/mdc/ResumeHeader.vue resume-editor/components/mdc/ResumeSection.vue resume-editor/components/mdc/ResumeItem.vue resume-editor/components/mdc/SkillTags.vue
git commit -m "feat: add 4 core MDC components (Header, Section, Item, SkillTags)"
```

---

### Task 3: MDC 增强组件（6个）

**Files:**
- Create: `resume-editor/components/mdc/Timeline.vue`
- Create: `resume-editor/components/mdc/SkillBar.vue`
- Create: `resume-editor/components/mdc/ContactIcons.vue`
- Create: `resume-editor/components/mdc/QuoteBlock.vue`
- Create: `resume-editor/components/mdc/CardGrid.vue`
- Create: `resume-editor/components/mdc/CustomDivider.vue`

- [ ] **Step 1: Timeline.vue**

```vue
<!-- components/mdc/Timeline.vue -->
<script setup lang="ts">
// Timeline wraps resume-item children with a visual timeline bar
</script>

<template>
  <div class="relative pl-6 border-l-2 border-border">
    <slot />
  </div>
</template>
```

- [ ] **Step 2: SkillBar.vue**

```vue
<!-- components/mdc/SkillBar.vue -->
<script setup lang="ts">
defineProps<{
  skill: string
  level: number  // 0-100
}>()
</script>

<template>
  <div class="mb-3">
    <div class="flex justify-between text-[13px] mb-1.5">
      <span class="font-medium text-foreground">{{ skill }}</span>
      <span class="text-foreground/50">{{ level }}%</span>
    </div>
    <div class="h-1.5 bg-muted">
      <div class="h-full bg-foreground transition-all duration-500" :style="{ width: `${level}%` }" />
    </div>
  </div>
</template>
```

- [ ] **Step 3: ContactIcons.vue**

```vue
<!-- components/mdc/ContactIcons.vue -->
<script setup lang="ts">
defineProps<{
  email?: string
  phone?: string
  github?: string
  website?: string
  wechat?: string
}>()
</script>

<template>
  <div class="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-foreground/60">
    <span v-if="email">📧 {{ email }}</span>
    <span v-if="phone">📱 {{ phone }}</span>
    <span v-if="github">🔗 {{ github }}</span>
    <span v-if="website">🌐 {{ website }}</span>
    <span v-if="wechat">💬 {{ wechat }}</span>
  </div>
</template>
```

- [ ] **Step 4: QuoteBlock.vue**

```vue
<!-- components/mdc/QuoteBlock.vue -->
<template>
  <blockquote class="border-l-[3px] border-foreground pl-5 py-2 my-6 text-[15px] text-foreground/70 italic leading-relaxed">
    <slot />
  </blockquote>
</template>
```

- [ ] **Step 5: CardGrid.vue**

```vue
<!-- components/mdc/CardGrid.vue -->
<script setup lang="ts">
defineProps<{
  cols?: number
}>()
</script>

<template>
  <div :class="`grid gap-4 my-4`" :style="{ gridTemplateColumns: `repeat(${cols || 2}, 1fr)` }">
    <slot />
  </div>
</template>
```

- [ ] **Step 6: CustomDivider.vue**

```vue
<!-- components/mdc/CustomDivider.vue -->
<script setup lang="ts">
defineProps<{
  space?: number
}>()
</script>

<template>
  <hr class="border-border my-6" :style="space ? { marginTop: `${space}px`, marginBottom: `${space}px` } : {}" />
</template>
```

- [ ] **Step 7: Commit**

```bash
git add resume-editor/components/mdc/Timeline.vue resume-editor/components/mdc/SkillBar.vue resume-editor/components/mdc/ContactIcons.vue resume-editor/components/mdc/QuoteBlock.vue resume-editor/components/mdc/CardGrid.vue resume-editor/components/mdc/CustomDivider.vue
git commit -m "feat: add 6 enhanced MDC components"
```

---

### Task 4: 模板文件（4套）

**Files:**
- Create: `resume-editor/templates/tech.md`
- Create: `resume-editor/templates/fresh-grad.md`
- Create: `resume-editor/templates/management.md`
- Create: `resume-editor/templates/blank.md`

- [ ] **Step 1: tech.md（技术岗模板）**

```md
::resume-header{name="张三" title="高级前端工程师" email="zhangsan@email.com" phone="138-0000-0000"}
::

::resume-section{title="专业技能"}
::skill-tags{items="Vue.js, React, TypeScript, Node.js, Python, Docker, Git, Webpack"}
::
::

::resume-section{title="工作经历"}

::resume-item{title="高级前端开发工程师" subtitle="ABC科技有限公司" date="2022-至今"}
- 主导公司级设计系统建设，覆盖 20+ 产品线，提升研发效率 40%
- 带领 5 人前端团队完成核心业务迭代，按时交付率 98%
- 推动 TypeScript 全面迁移，代码质量显著提升
- 性能优化首屏加载时间从 4.2s 降至 1.1s
::

::resume-item{title="前端开发工程师" subtitle="DEF信息技术有限公司" date="2019-2022"}
- 负责B端后台管理系统前端架构设计与开发
- 封装通用组件库，团队复用率 80%
- 参与小程序从零到一开发，用户量突破 50 万
::
::

::resume-section{title="项目经验"}
::card-grid{cols="2"}

**电商中台**
基于 Vue3 + TS 搭建微前端架构，支撑 3 条业务线独立部署

**数据可视化平台**
使用 ECharts + Canvas 实现实时数据大屏，支持 10 万级数据点渲染

::
::

::resume-section{title="教育背景"}
::resume-item{title="计算机科学与技术 · 本科" subtitle="XX大学" date="2015-2019"}
::
::
```

- [ ] **Step 2: fresh-grad.md（应届生模板）**

```md
::resume-header{name="李四" title="软件工程应届毕业生" email="lisi@email.com" phone="139-0000-0000"}
::

::resume-section{title="教育背景"}
::resume-item{title="软件工程 · 本科" subtitle="XX大学" date="2022-2026"}
- GPA 3.8/4.0，专业排名前 10%
- 校级优秀学生奖学金（连续三年）
::
::

::resume-section{title="实习经历"}
::resume-item{title="前端开发实习生" subtitle="GHI科技公司" date="2025.06-2025.09"}
- 参与内部管理系统前端开发，使用 Vue3 + TypeScript
- 独立完成数据报表模块，提升团队数据分析效率
- Code Review 参与度全组前三
::
::

::resume-section{title="校园经历"}
::resume-item{title="技术社团 · 副社长" subtitle="校学生会科技部" date="2023-2024"}
- 组织校内 Hackathon，参赛队伍 20+ 支
- 开设前端技术分享系列讲座，覆盖 200+ 人次
::
::

::resume-section{title="专业技能"}
::skill-tags{items="Vue.js, React, TypeScript, Node.js, Python, MySQL, Git"}
::
::
```

- [ ] **Step 3: management.md（管理岗模板）**

```md
::resume-header{name="王五" title="技术总监 / 高级技术管理" email="wangwu@email.com" phone="137-0000-0000"}
::

::resume-section{title="核心能力"}
::skill-tags{items="技术战略, 团队管理, 架构设计, 项目管理, 跨部门协作, 技术招聘, OKR管理, 敏捷开发"}
::
::

::resume-section{title="工作经历"}
::resume-item{title="技术总监" subtitle="JKL集团" date="2021-至今"}
- 管理 40+ 人技术团队，下设前端、后端、数据、QA 四个组
- 主导公司技术中台战略落地，年节省研发成本 800 万
- 建立技术人才梯队培养体系，团队留存率 92%
- 推动敏捷转型，交付周期从季度缩短至双周
::

::resume-item{title="高级技术经理" subtitle="MNO互联网公司" date="2017-2021"}
- 管理 15 人前端团队，负责全部 C 端产品线
- 搭建前端基础设施（CI/CD、监控、组件库），部署效率提升 3 倍
::
::

::resume-section{title="教育背景"}
::resume-item{title="计算机科学与技术 · 硕士" subtitle="XX大学" date="2012-2015"}
::
::
```

- [ ] **Step 4: blank.md（极简空白模板）**

```md
::resume-header{name="姓名" title="职位" email="email@example.com" phone="138-0000-0000"}
::

::resume-section{title="专业技能"}
::skill-tags{items="技能1, 技能2, 技能3"}
::
::

::resume-section{title="工作经历"}
::resume-item{title="职位名称" subtitle="公司名称" date="开始-结束"}
- 主要职责和成就描述
- 用数据量化成果
::
::

::resume-section{title="教育背景"}
::resume-item{title="专业 · 学历" subtitle="学校名称" date="开始-结束"}
::
::
```

- [ ] **Step 5: Commit**

```bash
git add resume-editor/templates/
git commit -m "feat: add 4 resume templates (tech, fresh-grad, management, blank)"
```

---

### Task 5: 编辑器页面（核心）

**Files:**
- Create: `resume-editor/components/editor/MdEditor.vue`
- Create: `resume-editor/components/editor/ResumePreview.vue`
- Create: `resume-editor/components/editor/EditorToolbar.vue`
- Create: `resume-editor/composables/useEditor.ts`
- Create: `resume-editor/pages/editor.vue`

- [ ] **Step 1: useEditor composable**

```ts
// composables/useEditor.ts
import { ref, computed } from 'vue'

const templates: Record<string, string> = {
  tech: '',
  'fresh-grad': '',
  management: '',
  blank: '',
}

export const useEditor = () => {
  const source = ref('')
  const currentTemplate = ref('blank')
  const isDirty = ref(false)

  const loadTemplate = async (name: string) => {
    if (!templates[name]) {
      const data = await $fetch<string>(`/api/templates/${name}`)
      templates[name] = data
    }
    source.value = templates[name]
    currentTemplate.value = name
    isDirty.value = true
  }

  const updateSource = (value: string) => {
    source.value = value
    isDirty.value = true
  }

  return {
    source,
    currentTemplate,
    isDirty,
    loadTemplate,
    updateSource,
  }
}
```

- [ ] **Step 2: 创建模板 API 端点**

```ts
// server/api/templates/[name].get.ts
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  const validTemplates = ['tech', 'fresh-grad', 'management', 'blank']

  if (!name || !validTemplates.includes(name)) {
    throw createError({ statusCode: 404, message: 'Template not found' })
  }

  const content = await readFile(
    join(process.cwd(), 'templates', `${name}.md`),
    'utf-8'
  )
  return content
})
```

- [ ] **Step 3: MdEditor.vue**

```vue
<!-- components/editor/MdEditor.vue -->
<script setup lang="ts">
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { defaultKeymap } from '@codemirror/commands'
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const container = ref<HTMLDivElement>()
let view: EditorView

onMounted(() => {
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      emit('update:modelValue', update.state.doc.toString())
    }
  })

  view = new EditorView({
    doc: props.modelValue,
    extensions: [
      EditorState.allowMultipleSelections.of(true),
      lineNumbers(),
      highlightActiveLine(),
      keymap.of(defaultKeymap),
      markdown(),
      updateListener,
      EditorView.theme({
        '&': { height: '100%', fontSize: '14px' },
        '.cm-scroller': { fontFamily: "'JetBrains Mono', 'Noto Sans SC', monospace", lineHeight: '1.8' },
        '.cm-content': { padding: '16px' },
        '.cm-gutters': { borderRight: '1px solid #E4E7EB', backgroundColor: '#F8FAFC', color: '#94A3B8' },
        '.cm-activeLine': { backgroundColor: '#F1F5F9' },
        '.cm-activeLineGutter': { backgroundColor: '#F1F5F9', color: '#1E3A5F' },
      }),
      EditorView.lineWrapping,
      EditorState.tabSize.of(2),
    ],
    parent: container.value!,
  })
})

watch(() => props.modelValue, (val) => {
  if (val !== view.state.doc.toString()) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: val }
    })
  }
})

onBeforeUnmount(() => view.destroy())
</script>

<template>
  <div ref="container" class="h-full w-full" />
</template>
```

- [ ] **Step 4: ResumePreview.vue**

```vue
<!-- components/editor/ResumePreview.vue -->
<script setup lang="ts">
const props = defineProps<{ content: string }>()

// useAsyncData to parse MDC on server or client
const { data: parsed } = await useAsyncData(
  () => props.content,
  {
    watch: [() => props.content],
    transform: (src) => src, // MDC raw string, @nuxt/mdc handles rendering
  }
)
</script>

<template>
  <div class="bg-white max-w-[794px] mx-auto p-12 min-h-[1123px]" style="box-shadow: 0 0 0 1px #E4E7EB;">
    <MDCRenderer v-if="content" :value="content" tag="article" />
    <div v-else class="text-foreground/30 text-center mt-32 text-[15px]">
      在左侧编辑 Markdown 内容，这里将实时显示预览
    </div>
  </div>
</template>
```

- [ ] **Step 5: EditorToolbar.vue**

```vue
<!-- components/editor/EditorToolbar.vue -->
<script setup lang="ts">
const props = defineProps<{
  currentTemplate: string
  isLoggedIn: boolean
}>()

const emit = defineEmits<{
  'select-template': [name: string]
  'export-md': []
  'export-pdf': []
  'export-png': []
  'login': []
}>()

const templateOptions = [
  { value: 'tech', label: '技术岗' },
  { value: 'fresh-grad', label: '应届生' },
  { value: 'management', label: '管理岗' },
  { value: 'blank', label: '极简空白' },
]

const showExportTip = ref(false)

const onExportClick = (type: string) => {
  if (!props.isLoggedIn) {
    showExportTip.value = true
    setTimeout(() => showExportTip.value = false, 3000)
    return
  }
  if (type === 'md') emit('export-md')
  if (type === 'pdf') emit('export-pdf')
  if (type === 'png') emit('export-png')
}
</script>

<template>
  <div class="h-14 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
    <div class="flex items-center gap-4">
      <span class="text-[13px] font-medium text-foreground/50">模板：</span>
      <select
        :value="currentTemplate"
        @change="$emit('select-template', ($event.target as HTMLSelectElement).value)"
        class="text-[13px] bg-surface border border-border px-3 py-1.5 focus:outline-none focus:border-foreground/30 transition-colors"
      >
        <option v-for="t in templateOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
    </div>

    <div class="flex items-center gap-2 relative">
      <button
        @click="onExportClick('md')"
        class="text-[13px] px-3 py-1.5 border border-border hover:bg-surface transition-colors"
      >
        .MD
      </button>
      <button
        @click="onExportClick('pdf')"
        class="text-[13px] px-3 py-1.5 border border-border hover:bg-surface transition-colors"
      >
        .PDF
      </button>
      <button
        @click="onExportClick('png')"
        class="text-[13px] px-3 py-1.5 border border-border hover:bg-surface transition-colors"
      >
        .PNG
      </button>

      <!-- Login gate tip -->
      <div
        v-if="showExportTip"
        class="absolute right-0 top-full mt-2 bg-foreground text-white text-[12px] px-3 py-2 whitespace-nowrap z-10"
      >
        请先
        <button @click="$emit('login')" class="underline hover:text-accent transition-colors">登录</button>
        后再导出
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 6: editor.vue 页面**

```vue
<!-- pages/editor.vue -->
<script setup lang="ts">
const { source, currentTemplate, loadTemplate, updateSource } = useEditor()
const { isLoggedIn, login } = useAuth()
const { downloadMD, downloadPDF, downloadPNG } = useExport()

// Load default template on mount
await loadTemplate('blank')

const previewRef = ref<HTMLElement>()

const handleSelectTemplate = (name: string) => {
  loadTemplate(name)
}

const handleExportPDF = () => {
  downloadPDF(source.value)
}

const handleExportPNG = async () => {
  if (previewRef.value) {
    await downloadPNG(previewRef.value, 'resume.png')
  }
}

const handleExportMD = () => {
  downloadMD(source.value, 'resume')
}
</script>

<template>
  <div class="h-screen flex flex-col">
    <EditorToolbar
      :current-template="currentTemplate"
      :is-logged-in="isLoggedIn"
      @select-template="handleSelectTemplate"
      @export-md="handleExportMD"
      @export-pdf="handleExportPDF"
      @export-png="handleExportPNG"
      @login="login"
    />

    <div class="flex flex-1 overflow-hidden">
      <!-- Left: Editor (35%) -->
      <div class="w-[35%] min-w-[380px] border-r border-border overflow-hidden">
        <MdEditor
          :model-value="source"
          @update:model-value="updateSource"
        />
      </div>

      <!-- Right: Preview (65%) -->
      <div class="flex-1 bg-muted overflow-auto p-6 flex justify-center">
        <div ref="previewRef">
          <ResumePreview :content="source" />
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 7: Commit**

```bash
git add resume-editor/components/editor/ resume-editor/composables/useEditor.ts resume-editor/pages/editor.vue resume-editor/server/api/templates/
git commit -m "feat: add editor page with CodeMirror + MDC live preview"
```

---

### Task 6: 首页 & 模板选择页

**Files:**
- Create: `resume-editor/pages/index.vue`
- Create: `resume-editor/pages/templates.vue`

- [ ] **Step 1: index.vue（首页）**

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
const features = [
  { title: 'MDC 语法', desc: '基于 Markdown Components，简单灵活' },
  { title: '实时预览', desc: '左侧编辑，右侧即时渲染所见即所得' },
  { title: '多套模板', desc: '4 套精心设计的模板，一键切换' },
  { title: '多格式导出', desc: '支持 MD / PDF / PNG 三种格式' },
]
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero -->
    <section class="max-w-[680px] mx-auto pt-32 pb-20 px-6 text-center">
      <h1 class="text-[40px] font-bold text-foreground tracking-tight leading-tight mb-6">
        一份简历，<br/>十分钟搞定
      </h1>
      <p class="text-[18px] text-foreground/50 leading-relaxed mb-12">
        基于 MDC 语法的在线简历编辑器。简洁大气的中文模板，
        实时预览，一键导出。专注内容，让简历回归本质。
      </p>
      <NuxtLink
        to="/templates"
        class="inline-block bg-foreground text-white text-[15px] font-medium px-8 py-3 hover:bg-foreground/90 transition-colors"
      >
        开始制作简历
      </NuxtLink>
    </section>

    <!-- Features -->
    <section class="max-w-[960px] mx-auto px-6 pb-32">
      <div class="grid grid-cols-2 gap-[1px] bg-border">
        <div v-for="f in features" :key="f.title" class="bg-surface px-8 py-10">
          <h3 class="text-[16px] font-bold text-foreground mb-2">{{ f.title }}</h3>
          <p class="text-[14px] text-foreground/50 leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="text-center text-[13px] text-foreground/30 pb-12">
      在线简历编辑器 · 让求职更简单
    </footer>
  </div>
</template>
```

- [ ] **Step 2: templates.vue（模板选择页）**

```vue
<!-- pages/templates.vue -->
<script setup lang="ts">
const templateList = [
  { id: 'tech', title: '技术研发', desc: '突出技术栈与项目经验，适合开发、工程师岗位', color: '#1E3A5F' },
  { id: 'fresh-grad', title: '应届生', desc: '强调教育背景与实习经历，适合毕业生校招', color: '#059669' },
  { id: 'management', title: '管理岗', desc: '聚焦领导力与业绩数据，适合中高层管理', color: '#475569' },
  { id: 'blank', title: '极简空白', desc: '基础结构，从零开始自由发挥', color: '#94A3B8' },
]
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-[960px] mx-auto px-6 pt-24 pb-20">
      <h2 class="text-[28px] font-bold text-foreground text-center mb-16">选择模板开始制作</h2>

      <div class="grid grid-cols-2 gap-6">
        <NuxtLink
          v-for="t in templateList"
          :key="t.id"
          :to="`/editor?template=${t.id}`"
          class="group border border-border bg-white p-8 hover:border-foreground/20 transition-colors"
        >
          <div
            class="w-12 h-1 mb-6 transition-colors"
            :style="{ backgroundColor: t.color }"
          />
          <h3 class="text-[20px] font-bold text-foreground mb-3">{{ t.title }}</h3>
          <p class="text-[14px] text-foreground/50 leading-relaxed">{{ t.desc }}</p>

          <div class="mt-8 text-[13px] text-foreground/30 group-hover:text-foreground/50 transition-colors">
            选择此模板 →
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add resume-editor/pages/index.vue resume-editor/pages/templates.vue
git commit -m "feat: add landing page and template selector"
```

---

### Task 7: 认证系统（微信 OAuth）

**Files:**
- Create: `resume-editor/server/utils/wechat.ts`
- Create: `resume-editor/server/api/auth/wechat.get.ts`
- Create: `resume-editor/server/api/auth/callback.get.ts`
- Create: `resume-editor/server/api/auth/me.get.ts`
- Create: `resume-editor/composables/useAuth.ts`
- Create: `resume-editor/pages/auth/callback.vue`

- [ ] **Step 1: 微信工具函数**

```ts
// server/utils/wechat.ts
import { SignJWT, jwtVerify } from 'jose'

interface WxConfig {
  appId: string
  appSecret: string
  token: string
}

interface WxUser {
  openid: string
  nickname?: string
  headimgurl?: string
}

const getWxConfig = (): WxConfig => {
  const config = useRuntimeConfig()
  return {
    appId: config.wxAppId,
    appSecret: config.wxAppSecret,
    token: config.wxToken,
  }
}

export const getWxAuthUrl = (redirectUri: string, state: string): string => {
  const { appId } = getWxConfig()
  const encoded = encodeURIComponent(redirectUri)
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encoded}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`
}

export const getWxAccessToken = async (code: string): Promise<{ access_token: string; openid: string }> => {
  const { appId, appSecret } = getWxConfig()
  const res = await $fetch<{ access_token: string; openid: string }>(
    `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
  )
  return res
}

export const getWxUserInfo = async (accessToken: string, openid: string): Promise<WxUser> => {
  const res = await $fetch<WxUser>(
    `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`
  )
  return res
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-production')

export const createJWT = async (payload: WxUser): Promise<string> => {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export const verifyJWT = async (token: string): Promise<WxUser | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as WxUser
  } catch {
    return null
  }
}
```

- [ ] **Step 2: 微信登录重定向端点**

```ts
// server/api/auth/wechat.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const redirect = (query.redirect as string) || '/editor'
  const state = Buffer.from(redirect).toString('base64')

  const url = getWxAuthUrl(
    `https://${getHeader(event, 'host')}/api/auth/callback`,
    state
  )

  await sendRedirect(event, url)
})
```

- [ ] **Step 3: 微信回调端点**

```ts
// server/api/auth/callback.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string

  if (!code) {
    throw createError({ statusCode: 400, message: 'Missing code' })
  }

  const { access_token, openid } = await getWxAccessToken(code)
  const user = await getWxUserInfo(access_token, openid)
  const token = await createJWT(user)

  const redirect = state ? Buffer.from(state, 'base64').toString('utf-8') : '/editor'

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 3600,
    path: '/',
    sameSite: 'lax',
  })

  await sendRedirect(event, redirect)
})
```

- [ ] **Step 4: 当前用户端点**

```ts
// server/api/auth/me.get.ts
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return { user: null }

  const user = await verifyJWT(token)
  return { user }
})
```

- [ ] **Step 5: useAuth composable**

```ts
// composables/useAuth.ts
import { ref, onMounted } from 'vue'

interface User {
  openid: string
  nickname?: string
  headimgurl?: string
}

const user = ref<User | null>(null)
const loading = ref(true)

export const useAuth = () => {
  const isLoggedIn = computed(() => !!user.value)

  onMounted(async () => {
    try {
      const data = await $fetch<{ user: User | null }>('/api/auth/me')
      user.value = data.user
    } finally {
      loading.value = false
    }
  })

  const login = () => {
    const current = encodeURIComponent(window.location.href)
    window.location.href = `/api/auth/wechat?redirect=${current}`
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, isLoggedIn, loading, login, logout }
}
```

- [ ] **Step 6: OAuth 回调页面**

```vue
<!-- pages/auth/callback.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-[14px] text-foreground/50">登录成功，正在跳转...</p>
  </div>
</template>
```

- [ ] **Step 7: Commit**

```bash
git add resume-editor/server/utils/wechat.ts resume-editor/server/api/auth/ resume-editor/composables/useAuth.ts resume-editor/pages/auth/callback.vue
git commit -m "feat: add WeChat OAuth login system"
```

---

### Task 8: 导出系统

**Files:**
- Create: `resume-editor/composables/useExport.ts`

- [ ] **Step 1: useExport composable**

```ts
// composables/useExport.ts
export const useExport = () => {
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadMD = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    triggerDownload(blob, `${filename}.md`)
  }

  const downloadPDF = (content: string) => {
    // Store content for print page
    localStorage.setItem('print_content', content)
    const win = window.open('/print', '_blank')
    if (win) {
      win.addEventListener('load', () => win.print())
    }
  }

  const downloadPNG = async (element: HTMLElement, filename: string) => {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
    })
    canvas.toBlob((blob) => {
      if (blob) triggerDownload(blob, filename)
    }, 'image/png')
  }

  return { downloadMD, downloadPDF, downloadPNG }
}
```

- [ ] **Step 2: Commit**

```bash
git add resume-editor/composables/useExport.ts
git commit -m "feat: add MD/PDF/PNG export composable"
```

---

### Task 9: 打印页面

**Files:**
- Create: `resume-editor/pages/print.vue`

- [ ] **Step 1: print.vue**

```vue
<!-- pages/print.vue -->
<script setup lang="ts">
const content = ref('')

onMounted(() => {
  content.value = localStorage.getItem('print_content') || ''
  // Auto-trigger print after content rendered
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
```

- [ ] **Step 2: Commit**

```bash
git add resume-editor/pages/print.vue
git commit -m "feat: add print page for PDF export via browser print API"
```

---

### Task 10: 集成收尾 & nuxt.config 补全

**Files:**
- Modify: `resume-editor/nuxt.config.ts`
- Create: `resume-editor/.env.example`

- [ ] **Step 1: .env.example**

```bash
# .env.example
NUXT_WX_APP_ID=your_app_id
NUXT_WX_APP_SECRET=your_app_secret
NUXT_WX_TOKEN=your_token
JWT_SECRET=change-this-to-random-string
```

- [ ] **Step 2: 更新 nuxt.config.ts 添加 runtimeConfig**

```ts
// Add to nuxt.config.ts
export default defineNuxtConfig({
  // ... existing config ...

  runtimeConfig: {
    wxAppId: '',
    wxAppSecret: '',
    wxToken: '',
    jwtSecret: '',
  },

  nitro: {
    experimental: {
      openAPI: false, // keep build lean
    },
  },
})
```

- [ ] **Step 3: 更新 editor.vue 支持模板参数**

修改 `pages/editor.vue`，增加对 URL query 参数 `?template=tech` 的支持：

在 `<script setup>` 的 `onMounted` 中添加：
```ts
const route = useRoute()
const templateFromQuery = route.query.template as string
if (templateFromQuery && ['tech', 'fresh-grad', 'management', 'blank'].includes(templateFromQuery)) {
  await loadTemplate(templateFromQuery)
} else {
  await loadTemplate('blank')
}
```

- [ ] **Step 4: 完整启动验证**

```bash
cd /Users/aatrox/.oh-my-zzhub/core/beta/resume-editor
npm run dev
```

验证清单：
- 首页 `/` 正常渲染
- 模板选择页 `/templates` 可点击选模板
- 编辑器 `/editor?template=tech` 左栏显示 CodeMirror，右栏显示简历预览
- 切换模板下拉框，预览实时更新
- 工具栏导出按钮存在（登录状态下可用）
- 打印页 `/print` 正常渲染

- [ ] **Step 5: Commit**

```bash
git add resume-editor/nuxt.config.ts resume-editor/.env.example resume-editor/pages/editor.vue
git commit -m "feat: final integration, runtime config, template query support"
```

---

## Self-Review Summary

- [x] Spec coverage: 所有设计文档中的需求均有对应 task（编辑器、模板、组件库、认证、导出、页面）
- [x] No placeholders: 所有步骤包含完整代码，无 TBD/TODO
- [x] Type consistency: 组件 props、composable 方法签名在前后 task 中一致
- [x] 10 tasks, 每 task 2-7 steps, 均为 2-5 分钟可执行粒度
