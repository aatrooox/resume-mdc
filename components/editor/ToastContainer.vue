<script setup lang="ts">
const { toasts } = useToast()
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
    <div
      v-for="t in toasts"
      :key="t.id"
      :class="[
        'px-4 py-3 text-[13px] font-medium shadow-lg transition-all pointer-events-auto',
        t.type === 'success' ? 'bg-green-600 text-white' :
        t.type === 'error' ? 'bg-red-600 text-white' :
        'bg-foreground text-white'
      ]"
    >
      {{ t.message }}
    </div>
  </div>
</template>
