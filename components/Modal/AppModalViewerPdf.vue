<template>
    <div class="app-pdf-viewer">
        <iframe v-if="viewerSrc" class="app-pdf-viewer__frame" :src="viewerSrc" :title="fileName || 'PDF 미리보기'" />

        <div v-else class="app-pdf-viewer__empty">
            미리보기할 PDF가 없습니다.
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    src?: string
    file?: File
    fileName?: string
}>()

const objectUrl = ref<string | null>(null)

const viewerSrc = computed(() => {
    if (props.src) return props.src
    return objectUrl.value
})

watchEffect((onCleanup) => {
    if (!props.file) {
        objectUrl.value = null
        return
    }

    const nextUrl = URL.createObjectURL(props.file)
    objectUrl.value = nextUrl

    onCleanup(() => {
        URL.revokeObjectURL(nextUrl)
        if (objectUrl.value === nextUrl) {
            objectUrl.value = null
        }
    })
})
</script>
