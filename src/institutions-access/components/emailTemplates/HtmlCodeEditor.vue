<template>
  <div ref="hostRef" class="HtmlCodeEditor" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { html } from '@codemirror/lang-html'

export interface HtmlCodeEditorProps {
  modelValue: string
  disabled?: boolean
}

const props = withDefaults(defineProps<HtmlCodeEditorProps>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const hostRef = ref<HTMLDivElement | null>(null)
let view: EditorView | null = null

onMounted(() => {
  if (!hostRef.value) return

  view = new EditorView({
    doc: props.modelValue,
    parent: hostRef.value,
    extensions: [
      basicSetup,
      html(),
      EditorView.editable.of(!props.disabled),
      EditorView.lineWrapping,
      EditorView.updateListener.of(update => {
        if (update.docChanged) emit('update:modelValue', update.state.doc.toString())
      })
    ]
  })
})

watch(
  () => props.modelValue,
  value => {
    if (!view || value === view.state.doc.toString()) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value }
    })
  }
)

watch(
  () => props.disabled,
  () => {
    // Rebuilding is cheaper than toggling editable on a live view.
    if (!view || !hostRef.value) return
    const doc = view.state.doc.toString()
    view.destroy()
    view = new EditorView({
      doc,
      parent: hostRef.value,
      extensions: [
        basicSetup,
        html(),
        EditorView.editable.of(!props.disabled),
        EditorView.lineWrapping,
        EditorView.updateListener.of(update => {
          if (update.docChanged) emit('update:modelValue', update.state.doc.toString())
        })
      ]
    })
  }
)

onBeforeUnmount(() => {
  view?.destroy()
  view = null
})
</script>

<style>
.HtmlCodeEditor {
  overflow: hidden;
  border: 1px solid var(--clr-grey-500);
  border-radius: var(--impresso-border-radius-xs);
  background-color: var(--impresso-color-white);
}
.HtmlCodeEditor .cm-editor {
  min-height: 16rem;
  max-height: 28rem;
  font-size: 0.85rem;
}
.HtmlCodeEditor .cm-editor.cm-focused {
  outline: none;
}
.HtmlCodeEditor:focus-within {
  outline: 2px solid var(--impresso-color-black);
  outline-offset: 2px;
}
.HtmlCodeEditor .cm-scroller {
  overflow: auto;
  font-family: var(--bs-font-monospace, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
