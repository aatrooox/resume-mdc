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
