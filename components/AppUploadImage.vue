<template>
    <div class="app-image-upload" :class="rootClasses" @dragenter.prevent="onDragEnter" @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave" @drop.prevent="onDrop">
        <div class="app-image-upload__head">
            <div class="app-image-upload__dropzone">
                <input ref="fileInput" class="app-image-upload__input" type="file" :accept="accept" :multiple="multiple"
                    :disabled="disabled" @change="onFileChange" />

                <button type="button" class="app-image-upload__trigger" :disabled="disabled" @click="openFile">
                    <span class="app-image-upload__trigger-icon" aria-hidden="true">
                        <Icon icon="mdi:image-plus" />
                    </span>

                    <span class="app-image-upload__trigger-text">
                        {{ triggerText }}
                    </span>

                    <span class="app-image-upload__trigger-subtext">
                        {{ helperText }}
                    </span>
                </button>
            </div>

            <div class="app-image-upload__actions">
                <AppButton variant="outline" size="sm" :disabled="disabled || !items.length" @click="clearAll">
                    {{ multiple ? '전체 삭제' : '이미지 삭제' }}
                </AppButton>
            </div>
        </div>

        <ul v-if="items.length" class="app-image-upload__list">
            <li v-for="uploadItem in items" :key="uploadItem.id" class="app-image-upload__item">
                <div class="app-image-upload__preview">
                    <img v-if="uploadItem.url" :src="uploadItem.url" :alt="uploadItem.alt || uploadItem.name" />

                    <div v-else class="app-image-upload__preview-empty">
                        NO IMAGE
                    </div>
                </div>

                <div class="app-image-upload__content">
                    <p class="app-image-upload__name">
                        {{ uploadItem.name }}
                    </p>

                    <div class="app-image-upload__meta">
                        <span class="app-image-upload__meta-item">
                            {{ uploadItem.type || 'unknown' }}
                        </span>
                        <span class="app-image-upload__meta-divider">·</span>
                        <span class="app-image-upload__meta-item">
                            {{ formatBytes(uploadItem.size) }}
                        </span>
                    </div>
                </div>

                <div class="app-image-upload__item-actions">
                    <AppButton v-if="uploadItem.url" variant="text" size="sm" ariaLabel="이미지 미리보기"
                        @click="previewItem(uploadItem)">
                        미리보기
                    </AppButton>

                    <AppButton variant="text" size="custom" :custom-size="{ width: 28, height: 28 }"
                        :disabled="disabled" ariaLabel="파일 삭제" @click="removeItem(uploadItem.id)">
                        <template #iconLeft>
                            <Icon icon="mdi:close" aria-hidden="true" />
                        </template>
                    </AppButton>
                </div>
            </li>
        </ul>

        <p v-if="hint" class="app-image-upload__hint">
            {{ hint }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { useModalViewer } from '~/composables/useModalViewer'

type ReadMode = 'dataUrl' | 'objectUrl'
type AppImageUploadValue = string | AppImageUploadItem
type AppImageUploadModelValue = AppImageUploadValue | AppImageUploadValue[] | null

export type AppImageUploadItem = {
    id: string
    name: string
    type: string
    size: number
    url: string
    alt?: string
    file?: File
    source?: 'sample' | 'upload'
}

const props = withDefaults(
    defineProps<{
        modelValue?: AppImageUploadModelValue
        disabled?: boolean
        multiple?: boolean
        accept?: string
        hint?: string
        triggerText?: string
        allowDrop?: boolean
        maxSizeBytes?: number
        maxCount?: number
        readMode?: ReadMode
    }>(),
    {
        modelValue: null,
        disabled: false,
        multiple: false,
        accept: 'image/*',
        hint: '',
        triggerText: '이미지 업로드',
        allowDrop: true,
        maxSizeBytes: undefined,
        maxCount: undefined,
        readMode: 'dataUrl',
    },
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: AppImageUploadItem | AppImageUploadItem[] | null): void
    (e: 'change', value: AppImageUploadItem | AppImageUploadItem[] | null): void
    (e: 'remove', item: AppImageUploadItem): void
    (e: 'clear'): void
    (e: 'error', payload: { message: string; detail?: unknown }): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const objectUrls = ref<string[]>([])
const { openImageViewer } = useModalViewer()

const rootClasses = computed(() => ({
    'is-disabled': props.disabled,
    'is-dragover': dragOver.value,
    'is-multiple': props.multiple,
}))

function createUrlItem(url: string, index = 0): AppImageUploadItem {
    const fallbackName = url.split('/').pop()?.split('?')[0] || `image-${index + 1}`
    return {
        id: `url-${index}-${url}`,
        name: fallbackName,
        type: 'image/url',
        size: 0,
        url,
        alt: fallbackName,
        source: 'sample',
    }
}

const items = computed<AppImageUploadItem[]>(() => {
    if (!props.modelValue) return []

    const sourceItems = Array.isArray(props.modelValue)
        ? props.modelValue
        : [props.modelValue]

    return sourceItems.map((value, index) =>
        typeof value === 'string'
            ? createUrlItem(value, index)
            : value,
    )
})

const helperText = computed(() => {
    const rules: string[] = []

    if (props.accept) {
        rules.push(`허용 형식: ${props.accept}`)
    }

    if (props.maxSizeBytes) {
        rules.push(`최대 용량: ${formatBytes(props.maxSizeBytes)}`)
    }

    if (props.multiple && props.maxCount) {
        rules.push(`최대 ${props.maxCount}개`)
    }

    return rules.join(' / ')
})

function createId() {
    return `image-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function openFile() {
    if (props.disabled) return
    fileInput.value?.click()
}

function formatBytes(bytes: number) {
    if (!bytes && bytes !== 0) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function cleanupObjectUrls() {
    objectUrls.value.forEach((url) => URL.revokeObjectURL(url))
    objectUrls.value = []
}

function emitValue(nextItems: AppImageUploadItem[]) {
    const value = props.multiple
        ? nextItems
        : nextItems[0] ?? null

    emit('update:modelValue', value)
    emit('change', value)
}

function error(message: string, detail?: unknown) {
    emit('error', { message, detail })
}

function isAcceptedType(file: File) {
    if (!props.accept || props.accept === '*/*') return true

    const acceptList = props.accept
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

    if (!acceptList.length) return true

    return acceptList.some((accept) => {
        if (accept.endsWith('/*')) {
            const baseType = accept.replace('/*', '')
            return file.type.startsWith(`${baseType}/`)
        }

        if (accept.startsWith('.')) {
            return file.name.toLowerCase().endsWith(accept.toLowerCase())
        }

        return file.type === accept
    })
}

async function shouldAccept(file: File) {
    if (!isAcceptedType(file)) {
        error('허용되지 않는 파일 형식입니다.', {
            accept: props.accept,
            type: file.type,
            name: file.name,
        })
        return false
    }

    if (props.maxSizeBytes != null && file.size > props.maxSizeBytes) {
        error('파일 용량 제한을 초과했습니다.', {
            maxSizeBytes: props.maxSizeBytes,
            size: file.size,
            name: file.name,
        })
        return false
    }

    return true
}

function toObjectUrl(file: File) {
    const url = URL.createObjectURL(file)
    objectUrls.value.push(url)
    return url
}

function readAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()

        reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'))
        reader.onload = () => resolve(String(reader.result ?? ''))

        reader.readAsDataURL(file)
    })
}

async function createItemFromFile(file: File): Promise<AppImageUploadItem | null> {
    const accepted = await shouldAccept(file)
    if (!accepted) return null

    const url = props.readMode === 'objectUrl'
        ? toObjectUrl(file)
        : await readAsDataUrl(file)

    return {
        id: createId(),
        name: file.name,
        type: file.type,
        size: file.size,
        url,
        alt: file.name,
        file,
        source: 'upload',
    }
}

async function appendFiles(files: File[]) {
    const createdItems = (await Promise.all(files.map(createItemFromFile)))
        .filter(Boolean) as AppImageUploadItem[]

    if (!createdItems.length) return

    let nextItems = props.multiple
        ? [...items.value, ...createdItems]
        : [createdItems[0]]

    if (props.multiple && props.maxCount != null) {
        nextItems = nextItems.slice(0, props.maxCount)
    }

    emitValue(nextItems)
}

function removeItem(id: string) {
    const target = items.value.find((uploadItem) => uploadItem.id === id)
    if (!target) return

    emit('remove', target)
    emitValue(items.value.filter((uploadItem) => uploadItem.id !== id))
}

function previewItem(item: AppImageUploadItem) {
    openImageViewer({
        name: item.name,
        url: item.url,
        alt: item.alt,
    })
}

function clearAll() {
    if (items.value.length === 1) {
        emit('remove', items.value[0])
    }
    emit('clear')
    emitValue([])
}

async function onFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    const files = Array.from(target.files ?? [])

    if (!files.length) return

    await appendFiles(files)
    target.value = ''
}

function onDragEnter() {
    if (!props.allowDrop || props.disabled) return
    dragOver.value = true
}

function onDragOver() {
    if (!props.allowDrop || props.disabled) return
    dragOver.value = true
}

function onDragLeave() {
    dragOver.value = false
}

async function onDrop(event: DragEvent) {
    dragOver.value = false

    if (!props.allowDrop || props.disabled) return

    const files = Array.from(event.dataTransfer?.files ?? [])
    if (!files.length) return

    await appendFiles(files)
}

watch(
    () => props.modelValue,
    () => {
        if (props.readMode !== 'objectUrl') return

        const validUrls = items.value
            .filter((uploadItem) => uploadItem.source === 'upload')
            .map((uploadItem) => uploadItem.url)

        objectUrls.value = objectUrls.value.filter((url) => validUrls.includes(url))
    },
    { deep: true },
)

onBeforeUnmount(() => {
    cleanupObjectUrls()
})
</script>