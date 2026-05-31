<template>
    <div class="workspace">
        <div class="workspace__content">
            <section class="workspace-pane workspace__pane">
                <div class="workspace-pane__body">
                    <div class="toast-editor" ref="editorRoot" />
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import type Editor from '@toast-ui/editor'
import { useWorkspaceStore } from '~/stores/workspace'

const ws = useWorkspaceStore()

const editorRoot = ref<HTMLDivElement | null>(null)
let editor: Editor | null = null
let isSettingValue = false

onMounted(async () => {
    if (!editorRoot.value) return

    const [{ default: ToastEditor }] = await Promise.all([
        import('@toast-ui/editor'),
        import('@toast-ui/editor/dist/toastui-editor.css'),
    ])

    editor = new ToastEditor({
        el: editorRoot.value,
        height: '100%',
        initialEditType: 'markdown',
        previewStyle: 'vertical',
        initialValue: ws.leftTab.content ?? '',
        usageStatistics: false,
    })

    editor.on('change', () => {
        if (!editor || isSettingValue) return
        ws.updateTabContent(ws.activeTabIdByPane.left, editor.getMarkdown())
    })
})

watch(
    () => ws.leftTab.content,
    (v) => {
        if (!editor) return
        const current = editor.getMarkdown()
        if (v === current) return
        isSettingValue = true
        editor.setMarkdown(v ?? '', false)
        isSettingValue = false
    },
)

onBeforeUnmount(() => {
    editor?.destroy()
    editor = null
})
</script>
