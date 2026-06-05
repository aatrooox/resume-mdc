<script setup lang="ts">
const features = [
  { title: 'MDC 语法', desc: '基于 Markdown Components，简单灵活' },
  { title: '实时预览', desc: '左侧编辑，右侧即时渲染所见即所得' },
  { title: '多套模板', desc: '4 套精心设计的模板，一键切换' },
  { title: '多格式导出', desc: '支持 MD / PDF / PNG 三种格式' },
]

const templateList = [
  { id: 'tech', title: '技术研发', desc: '突出技术栈与项目经验，适合开发、工程师岗位', color: '#1E3A5F' },
  { id: 'fresh-grad', title: '应届生', desc: '强调教育背景与实习经历，适合毕业生校招', color: '#059669' },
  { id: 'management', title: '管理岗', desc: '聚焦领导力与业绩数据，适合中高层管理', color: '#475569' },
  { id: 'blank', title: '极简空白', desc: '基础结构，从零开始自由发挥', color: '#94A3B8' },
]

const scrollToTemplates = () => {
  document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero -->
    <section class="max-w-[680px] mx-auto pt-32 pb-16 px-6 text-center">
      <h1 class="text-[40px] font-bold text-foreground tracking-tight leading-tight mb-6">
        一份简历，<br/>十分钟搞定
      </h1>
      <p class="text-[18px] text-foreground/50 leading-relaxed mb-12">
        基于 MDC 语法的在线简历编辑器。简洁大气的中文模板，
        实时预览，一键导出。专注内容，让简历回归本质。
      </p>
      <button
        @click="scrollToTemplates"
        class="inline-block bg-foreground text-white text-[15px] font-medium px-8 py-3 hover:bg-foreground/90 transition-colors cursor-pointer"
      >
        开始制作简历
      </button>
    </section>

    <!-- 模板选择 -->
    <section id="templates-section" class="max-w-[960px] mx-auto px-6 pb-12">
      <h2 class="text-[28px] font-bold text-foreground text-center mb-12">选择模板开始制作</h2>

      <div class="grid grid-cols-2 gap-6">
        <NuxtLink
          v-for="t in templateList"
          :key="t.id"
          :to="`/editor?template=${t.id}`"
          class="group border border-border bg-white p-8 hover:border-foreground/20 transition-colors"
        >
          <div class="w-12 h-1 mb-6 transition-colors" :style="{ backgroundColor: t.color }" />
          <h3 class="text-[20px] font-bold text-foreground mb-3">{{ t.title }}</h3>
          <p class="text-[14px] text-foreground/50 leading-relaxed">{{ t.desc }}</p>
          <div class="mt-8 text-[13px] text-foreground/30 group-hover:text-foreground/50 transition-colors">
            选择此模板 →
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- 特性 -->
    <section class="max-w-[960px] mx-auto px-6 pb-32">
      <div class="grid grid-cols-2 gap-[1px] bg-border">
        <div v-for="f in features" :key="f.title" class="bg-surface px-8 py-10">
          <h3 class="text-[16px] font-bold text-foreground mb-2">{{ f.title }}</h3>
          <p class="text-[14px] text-foreground/50 leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <footer class="text-center text-[13px] text-foreground/30 pb-12">
      在线简历编辑器 · 让求职更简单
    </footer>
  </div>
</template>
