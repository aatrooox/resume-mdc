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
