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
    <span v-if="email">邮箱: {{ email }}</span>
    <span v-if="phone">电话: {{ phone }}</span>
    <span v-if="github">GitHub: {{ github }}</span>
    <span v-if="website">网站: {{ website }}</span>
    <span v-if="wechat">微信: {{ wechat }}</span>
  </div>
</template>
