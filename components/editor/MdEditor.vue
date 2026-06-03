<script setup lang="ts">
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { defaultKeymap } from '@codemirror/commands'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const container = ref<HTMLDivElement>()
let view: EditorView

onMounted(() => {
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      emit('update:modelValue', update.state.doc.toString())
    }
  })

  view = new EditorView({
    doc: props.modelValue,
    extensions: [
      EditorState.allowMultipleSelections.of(true),
      lineNumbers(),
      highlightActiveLine(),
      keymap.of(defaultKeymap),
      markdown(),
      updateListener,
      EditorView.theme({
        '&': { height: '100%', fontSize: '14px' },
        '.cm-scroller': { fontFamily: "'JetBrains Mono', 'Noto Sans SC', monospace", lineHeight: '1.8' },
        '.cm-content': { padding: '16px' },
        '.cm-gutters': { borderRight: '1px solid #E4E7EB', backgroundColor: '#F8FAFC', color: '#94A3B8' },
        '.cm-activeLine': { backgroundColor: '#F1F5F9' },
        '.cm-activeLineGutter': { backgroundColor: '#F1F5F9', color: '#1E3A5F' },
      }),
      EditorView.lineWrapping,
      EditorState.tabSize.of(2),
    ],
    parent: container.value!,
  })
})

watch(() => props.modelValue, (val) => {
  if (val !== view.state.doc.toString()) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: val }
    })
  }
})

onBeforeUnmount(() => view.destroy())
</script>

<template>
  <div ref="container" class="h-full w-full" />
</template>
