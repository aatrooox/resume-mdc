<script setup lang="ts">
const { source, currentTemplate, loadTemplate, updateSource } = useEditor()
const { user, isLoggedIn, login, logout } = useAuth()
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
  if (!previewRef.value) {
    console.error('Preview element not found for PNG export')
    return
  }
  try {
    await downloadPNG(previewRef.value, 'resume.png')
  } catch (err) {
    console.error('PNG export failed:', err)
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
