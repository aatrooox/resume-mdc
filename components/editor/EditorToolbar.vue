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
