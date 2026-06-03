<script setup lang="ts">
const { source, currentTemplate, loadTemplate, updateSource } = useEditor()
const { isLoggedIn, login } = useAuth()
const { downloadMD, downloadPDF, downloadPNG } = useExport()

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
      <div class="w-[35%] min-w-[380px] border-r border-border overflow-hidden">
        <MdEditor
          :model-value="source"
          @update:model-value="updateSource"
        />
      </div>

      <div class="flex-1 bg-muted overflow-auto p-6 flex justify-center">
        <div ref="previewRef">
          <ResumePreview :content="source" />
        </div>
      </div>
    </div>
  </div>
</template>
