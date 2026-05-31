<template>
    <div class="app-grid-cell-image" @dragenter.stop @dragover.stop @dragleave.stop @drop.stop>
        <AppUploadImage v-model="value" :multiple="imageOptions.multiple" :max-count="imageOptions.maxCount"
            :accept="imageOptions.accept" :hint="imageOptions.hint" :trigger-text="imageOptions.triggerText"
            :allow-drop="imageOptions.allowDrop" :max-size-bytes="imageOptions.maxSizeBytes"
            :read-mode="imageOptions.readMode" />
    </div>
</template>

<script setup lang="ts">
type ReadMode = 'dataUrl' | 'objectUrl'
type ImageCellValue =
    | string
    | {
        id: string
        name: string
        type: string
        size: number
        url: string
        alt?: string
        file?: File
        source?: 'sample' | 'upload'
    }
    | Array<string | {
        id: string
        name: string
        type: string
        size: number
        url: string
        alt?: string
        file?: File
        source?: 'sample' | 'upload'
    }>
    | null

type ImageCellParams = {
    multiple?: boolean
    maxCount?: number
    accept?: string
    hint?: string
    triggerText?: string
    allowDrop?: boolean
    maxSizeBytes?: number
    readMode?: ReadMode
}

const props = defineProps({
    params: Object
})

const params = props.params

const imageOptions = computed<ImageCellParams>(() => ({
    multiple: Boolean(params?.colDef?.cellRendererParams?.multiple),
    maxCount: params?.colDef?.cellRendererParams?.maxCount,
    accept: params?.colDef?.cellRendererParams?.accept,
    hint: params?.colDef?.cellRendererParams?.hint,
    triggerText: params?.colDef?.cellRendererParams?.triggerText,
    allowDrop: params?.colDef?.cellRendererParams?.allowDrop ?? true,
    maxSizeBytes: params?.colDef?.cellRendererParams?.maxSizeBytes,
    readMode: params?.colDef?.cellRendererParams?.readMode,
}))

const value = computed({

    get: (): ImageCellValue => params?.value,

    set: (v: ImageCellValue) => {

        params?.node?.setDataValue(
            params?.column?.getColId(),
            v
        )

    }

})

</script>