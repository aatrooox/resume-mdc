<script setup lang="ts">
const { source, currentTemplate, loadTemplate, updateSource } = useEditor()
const { user, isLoggedIn, loading, login, logout } = useAuth()
const { downloadMD, downloadPDF, downloadPNG } = useExport()
const { show: toast } = useToast()

// Load template from query param or default
const route = useRoute()
const templateFromQuery = route.query.template as string
if (templateFromQuery && ['tech', 'fresh-grad', 'management', 'blank'].includes(templateFromQuery)) {
  await loadTemplate(templateFromQuery)
} else {
  await loadTemplate('blank')
}

const previewRef = ref<HTMLElement>()

const handleSelectTemplate = (name: string) => {
  loadTemplate(name)
}

const handleExportPDF = async () => {
  if (!previewRef.value) {
    toast('预览区域未就绪，请稍后再试', 'error')
    return
  }
  toast('正在生成PDF，请在弹出的打印窗口中完成导出', 'info')
  const result = await downloadPDF(previewRef.value)
  if (!result.success) {
    toast(result.error || 'PDF 导出失败', 'error')
  }
}

const handleExportPNG = async () => {
  if (!previewRef.value) {
    toast('预览区域未就绪，请稍后再试', 'error')
    return
  }
  const result = await downloadPNG(previewRef.value)
  if (result.success) {
    toast('PNG 导出成功', 'success')
  } else {
    toast(result.error || 'PNG 导出失败', 'error')
  }
}

const handleExportMD = () => {
  downloadMD(source.value, 'resume')
  toast('Markdown 导出成功', 'success')
}
</script>

<template>
  <div class="h-screen flex flex-col">
    <EditorToolbar
      :current-template="currentTemplate"
      :is-logged-in="isLoggedIn"
      :loading="loading"
      :user="user"
      @select-template="handleSelectTemplate"
      @export-md="handleExportMD"
      @export-pdf="handleExportPDF"
      @export-png="handleExportPNG"
      @login="login"
      @logout="logout"
    />

    <div class="flex flex-1 overflow-hidden flex-col md:flex-row">
      <div class="md:w-[35%] md:min-w-[380px] border-b md:border-b-0 md:border-r border-border h-[45%] md:h-full overflow-hidden">
        <MdEditor
          :model-value="source"
          @update:model-value="updateSource"
        />
      </div>

      <div class="flex-1 bg-muted overflow-auto p-4 md:p-6 flex justify-center">
        <div ref="previewRef">
          <ResumePreview :content="source" />
        </div>
      </div>
    </div>

  </div>
</template>
