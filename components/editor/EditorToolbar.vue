<script setup lang="ts">
interface User {
  userId: string
  email: string
  username: string
  role: string
}

const props = defineProps<{
  currentTemplate: string
  isLoggedIn: boolean
  loading: boolean
  user: User | null
}>()

const emit = defineEmits<{
  'select-template': [name: string]
  'export-md': []
  'export-pdf': []
  'export-png': []
  'login': []
  'logout': []
}>()

const templateOptions = [
  { value: 'tech', label: '技术岗' },
  { value: 'fresh-grad', label: '应届生' },
  { value: 'management', label: '管理岗' },
  { value: 'blank', label: '极简空白' },
]

const showExportTip = ref(false)
const showUserMenu = ref(false)

const onExportClick = (type: string) => {
  if (props.loading) return

  if (!props.isLoggedIn) {
    showExportTip.value = true
    setTimeout(() => showExportTip.value = false, 5000)
    return
  }
  if (type === 'md') emit('export-md')
  if (type === 'pdf') emit('export-pdf')
  if (type === 'png') emit('export-png')
}
</script>

<template>
  <div class="h-14 bg-white border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
    <div class="flex items-center gap-3 md:gap-4">
      <NuxtLink
        to="/"
        class="text-[13px] text-foreground/50 hover:text-foreground transition-colors flex items-center gap-1 shrink-0"
      >
        <span class="text-[15px] leading-none">&#8592;</span>
        <span class="hidden md:inline">首页</span>
      </NuxtLink>

      <span class="text-border select-none hidden md:inline">|</span>

      <span class="text-[13px] font-medium text-foreground/50 hidden md:inline">模板：</span>
      <select
        :value="currentTemplate"
        @change="$emit('select-template', ($event.target as HTMLSelectElement).value)"
        class="text-[13px] bg-surface border border-border px-2 md:px-3 py-1.5 focus:outline-none focus:border-foreground/30 transition-colors"
      >
        <option v-for="t in templateOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
    </div>

    <div class="flex items-center gap-2 relative">
      <span class="text-[11px] text-foreground/30 uppercase tracking-wider mr-1 hidden md:inline">导出</span>
      <button
        @click="onExportClick('md')"
        :disabled="loading"
        :class="[
          'text-[12px] px-2 md:px-3 py-1.5 border transition-colors font-medium',
          loading ? 'border-border text-foreground/20 cursor-not-allowed' : 'border-border hover:bg-surface'
        ]"
      >
        MD
      </button>
      <button
        @click="onExportClick('pdf')"
        :disabled="loading"
        :class="[
          'text-[12px] px-2 md:px-3 py-1.5 border transition-colors font-medium',
          loading ? 'border-border text-foreground/20 cursor-not-allowed' : 'border-border hover:bg-surface'
        ]"
      >
        PDF
      </button>
      <button
        @click="onExportClick('png')"
        :disabled="loading"
        :class="[
          'text-[12px] px-2 md:px-3 py-1.5 border transition-colors font-medium',
          loading ? 'border-border text-foreground/20 cursor-not-allowed' : 'border-border hover:bg-surface'
        ]"
      >
        PNG
      </button>

      <div
        v-if="showExportTip"
        class="absolute right-0 top-full mt-2 bg-foreground text-white text-[12px] px-3 py-2 whitespace-nowrap z-10"
      >
        请先
        <button @click="$emit('login')" class="underline hover:text-accent transition-colors">登录</button>
        后再导出
      </div>

      <span class="text-border select-none mx-1">|</span>

      <!-- Login state -->
      <button
        v-if="!isLoggedIn"
        @click="$emit('login')"
        class="text-[12px] px-3 py-1.5 bg-foreground text-white hover:bg-foreground/90 transition-colors font-medium shrink-0"
      >
        登录
      </button>

      <div v-else class="relative">
        <button
          @click="showUserMenu = !showUserMenu"
          class="text-[12px] px-3 py-1.5 border border-border hover:bg-surface transition-colors font-medium flex items-center gap-1 shrink-0"
        >
          <span class="truncate max-w-[80px]">{{ user?.username || user?.email || '用户' }}</span>
          <span class="text-[10px] text-foreground/30">&#9660;</span>
        </button>

        <div
          v-if="showUserMenu"
          class="absolute right-0 top-full mt-1 bg-white border border-border shadow-sm z-10 py-1 min-w-[120px]"
          @mouseleave="showUserMenu = false"
        >
          <div class="px-3 py-1.5 text-[11px] text-foreground/40 border-b border-border truncate">
            {{ user?.email }}
          </div>
          <button
            @click="$emit('logout'); showUserMenu = false"
            class="w-full text-left px-3 py-1.5 text-[12px] text-foreground/60 hover:bg-surface transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
