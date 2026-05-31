<template>
    <div class="page-demo">
        <div class="page-demo-layout">
            <main class="page-demo-main">
                <header class="page-demo__header">
                    <h1 class="page-demo__title">{{ title }}</h1>
                    <p class="page-demo__desc">
                        단일/다중 이미지 업로드 필드 컴포넌트입니다.
                        multiple, disabled, allowDrop, readMode, maxSizeBytes 등의 속성을 확인할 수 있습니다.
                    </p>
                </header>

                <!-- BASIC -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Basic</h2>
                    <p class="page-demo-card__desc">
                        가장 기본적인 이미지 업로드 예시입니다. 업로드 후 각 항목의 미리보기 버튼으로 이미지 뷰어 모달을 열 수 있습니다.
                    </p>

                    <div class="page-demo-row">
                        <AppUploadImage v-model="basic.imageUrl" @change="onBasicChange" @error="onError"
                            @remove="onRemove" />

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">
                                단일 이미지 업로드용 기본 예시입니다.
                            </div>

                            <div class="page-demo-actions">
                                <AppButton size="sm" variant="outline" @click="setBasicSample">
                                    샘플 이미지
                                </AppButton>

                                <AppButton size="sm" variant="text" :disabled="!basic.imageUrl" @click="clearBasic">
                                    값 비우기
                                </AppButton>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- STATE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">State & Control</h2>
                    <p class="page-demo-card__desc">
                        disabled 상태와 외부 제어 예시입니다.
                    </p>

                    <div class="page-demo-row">
                        <AppUploadImage v-model="state.imageUrl" :disabled="state.disabled" @change="onStateChange"
                            @error="onError" />

                        <div class="page-demo-stack">
                            <div class="page-demo-actions">
                                <AppButton size="sm" variant="outline" @click="setStateSample">
                                    샘플 이미지
                                </AppButton>

                                <AppButton size="sm" variant="text" @click="toggleDisabled">
                                    disabled: {{ state.disabled ? 'ON' : 'OFF' }}
                                </AppButton>

                                <AppButton size="sm" variant="text" :disabled="!state.imageUrl" @click="clearState">
                                    값 비우기
                                </AppButton>
                            </div>

                            <div class="page-demo-hint">
                                <strong>disabled</strong> 속성으로 선택/드롭 동작을 막을 수 있습니다.
                            </div>
                        </div>
                    </div>
                </section>

                <!-- MULTIPLE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Multiple</h2>
                    <p class="page-demo-card__desc">
                        여러 이미지를 업로드하고 최대 개수 제한을 적용하는 예시입니다.
                    </p>

                    <div class="page-demo-row">
                        <AppUploadImage v-model="multiple.images" multiple :max-count="3" @change="onMultipleChange"
                            @error="onError" @remove="onRemove" />

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">
                                최대 3개까지 업로드할 수 있습니다.
                            </div>

                            <div class="page-demo-actions">
                                <AppButton size="sm" variant="outline" @click="setMultipleSamples">
                                    샘플 이미지
                                </AppButton>

                                <AppButton size="sm" variant="text" :disabled="!multiple.images.length"
                                    @click="clearMultiple">
                                    값 비우기
                                </AppButton>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- READ MODE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Read Mode</h2>
                    <p class="page-demo-card__desc">
                        <code>readMode="dataUrl"</code> 와 <code>readMode="objectUrl"</code> 차이를 확인합니다.
                    </p>

                    <div class="page-demo-grid">
                        <div class="page-demo-stack">
                            <AppUploadImage v-model="readMode.dataUrlImage" read-mode="dataUrl"
                                @change="onDataUrlChange" @error="onError" />

                            <div class="page-demo-hint">
                                <strong>dataUrl</strong>은 문자열 데이터로 읽어 바로 바인딩할 때 사용합니다.
                            </div>
                        </div>

                        <div class="page-demo-stack">
                            <AppUploadImage v-model="readMode.objectUrlImage" read-mode="objectUrl"
                                @change="onObjectUrlChange" @error="onError" />

                            <div class="page-demo-hint">
                                <strong>objectUrl</strong>은 브라우저 URL을 만들어 미리보기할 때 유리합니다.
                            </div>
                        </div>
                    </div>
                </section>

                <!-- DRAG & DROP -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Drag & Drop</h2>
                    <p class="page-demo-card__desc">
                        <code>allowDrop</code> 속성으로 드래그 앤 드롭 허용 여부를 제어합니다.
                    </p>

                    <div class="page-demo-grid">
                        <div class="page-demo-stack">
                            <AppUploadImage v-model="drop.enabled" :allow-drop="true" @change="onDropEnabledChange"
                                @error="onError" />

                            <div class="page-demo-hint">
                                드롭 가능 상태입니다.
                            </div>
                        </div>

                        <div class="page-demo-stack">
                            <AppUploadImage v-model="drop.disabled" :allow-drop="false" @change="onDropDisabledChange"
                                @error="onError" />

                            <div class="page-demo-hint">
                                드롭 비허용 상태입니다.
                            </div>
                        </div>
                    </div>
                </section>

                <!-- FILE RULES -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">File Rules</h2>
                    <p class="page-demo-card__desc">
                        파일 형식과 최대 용량 제한 예시입니다.
                    </p>

                    <div class="page-demo-grid">
                        <div class="page-demo-stack">
                            <AppUploadImage v-model="rules.imageOnly" accept="image/png,image/jpeg,image/webp"
                                @change="onRulesImageChange" @error="onError" />

                            <div class="page-demo-hint">
                                <strong>accept</strong> 속성으로 허용 파일 형식을 제한합니다.
                            </div>
                        </div>

                        <div class="page-demo-stack">
                            <AppUploadImage v-model="rules.maxSizeImage" :max-size-bytes="rules.maxSizeBytes"
                                @change="onRulesSizeChange" @error="onError" />

                            <div class="page-demo-hint">
                                <strong>maxSizeBytes</strong> 속성으로 최대 용량을 제한합니다.
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <aside class="page-demo-aside" aria-label="현재 값 패널">
                <div class="page-demo-aside__sticky">
                    <section class="page-demo-card">
                        <h2 class="page-demo-card__title">Actions</h2>
                        <div class="page-demo-actions">
                            <AppButton variant="fill" @click="setAllSamples">
                                샘플 이미지 일괄 적용
                            </AppButton>

                            <AppButton variant="text" @click="resetAll">
                                초기화
                            </AppButton>
                        </div>
                    </section>

                    <section class="page-demo-card">
                        <h2 class="page-demo-card__title">Current Value</h2>
                        <pre class="page-demo-output">{{ output }}</pre>
                    </section>
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
const { title } = useDemoI18n('uploadImage')
const description = '이미지 업로드 필드 속성별 동작을 확인하는 데모입니다.'

type FileMeta = {
    name: string
    type: string
    size: number
    lastModified: number
}

type ImageFieldItem = {
    id: string
    name: string
    type: string
    size: number
    url: string
    alt?: string
    file?: File
    source?: 'sample' | 'upload'
}

const basic = reactive({
    imageUrl: null as ImageFieldItem | null,
    file: null as FileMeta | null,
})

const state = reactive({
    imageUrl: null as ImageFieldItem | null,
    disabled: false,
    file: null as FileMeta | null,
})

const multiple = reactive({
    images: [] as ImageFieldItem[],
    files: [] as FileMeta[],
})

const readMode = reactive({
    dataUrlImage: null as ImageFieldItem | null,
    objectUrlImage: null as ImageFieldItem | null,
    dataUrlFile: null as FileMeta | null,
    objectUrlFile: null as FileMeta | null,
})

const drop = reactive({
    enabled: null as ImageFieldItem | null,
    disabled: null as ImageFieldItem | null,
    enabledFile: null as FileMeta | null,
    disabledFile: null as FileMeta | null,
})

const rules = reactive({
    imageOnly: null as ImageFieldItem | null,
    maxSizeImage: null as ImageFieldItem | null,
    maxSizeBytes: 2 * 1024 * 1024,
    imageOnlyFile: null as FileMeta | null,
    maxSizeFile: null as FileMeta | null,
})

const lastError = ref<{ message: string; detail?: unknown } | null>(null)
const removedCount = ref(0)

function toMeta(file: File): FileMeta {
    return {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
    }
}

function toSampleImage(url: string, name = 'sample-image') {
    return {
        id: `sample-${name}`,
        name,
        type: 'image/jpeg',
        size: 0,
        url,
        alt: name,
        source: 'sample' as const,
    } satisfies ImageFieldItem
}

function updateFileMeta(item: ImageFieldItem | ImageFieldItem[] | null, assign: (meta: FileMeta | null) => void) {
    const nextItem = Array.isArray(item) ? item[0] ?? null : item
    assign(nextItem?.file ? toMeta(nextItem.file) : null)
    lastError.value = null
}

function updateFileMetaList(item: ImageFieldItem | ImageFieldItem[] | null, assign: (meta: FileMeta[]) => void) {
    const nextItems = Array.isArray(item)
        ? item
        : item ? [item] : []
    assign(
        nextItems
            .filter((uploadItem) => Boolean(uploadItem.file))
            .map((uploadItem) => toMeta(uploadItem.file as File)),
    )
    lastError.value = null
}

function onBasicChange(item: ImageFieldItem | ImageFieldItem[] | null) {
    updateFileMeta(item, (meta) => { basic.file = meta })
    lastError.value = null
}

function onStateChange(item: ImageFieldItem | ImageFieldItem[] | null) {
    updateFileMeta(item, (meta) => { state.file = meta })
}

function onMultipleChange(item: ImageFieldItem | ImageFieldItem[] | null) {
    updateFileMetaList(item, (meta) => { multiple.files = meta })
}

function onDataUrlChange(item: ImageFieldItem | ImageFieldItem[] | null) {
    updateFileMeta(item, (meta) => { readMode.dataUrlFile = meta })
}

function onObjectUrlChange(item: ImageFieldItem | ImageFieldItem[] | null) {
    updateFileMeta(item, (meta) => { readMode.objectUrlFile = meta })
}

function onDropEnabledChange(item: ImageFieldItem | ImageFieldItem[] | null) {
    updateFileMeta(item, (meta) => { drop.enabledFile = meta })
}

function onDropDisabledChange(item: ImageFieldItem | ImageFieldItem[] | null) {
    updateFileMeta(item, (meta) => { drop.disabledFile = meta })
}

function onRulesImageChange(item: ImageFieldItem | ImageFieldItem[] | null) {
    updateFileMeta(item, (meta) => { rules.imageOnlyFile = meta })
}

function onRulesSizeChange(item: ImageFieldItem | ImageFieldItem[] | null) {
    updateFileMeta(item, (meta) => { rules.maxSizeFile = meta })
}

function setBasicSample() {
    basic.imageUrl = toSampleImage('https://picsum.photos/240?random=11', 'basic-sample')
}

function setStateSample() {
    state.imageUrl = toSampleImage('https://picsum.photos/240?random=12', 'state-sample')
}

function setMultipleSamples() {
    multiple.images = [
        toSampleImage('https://picsum.photos/240?random=21', 'multiple-sample-1'),
        toSampleImage('https://picsum.photos/240?random=22', 'multiple-sample-2'),
        toSampleImage('https://picsum.photos/240?random=23', 'multiple-sample-3'),
    ]
}

function setAllSamples() {
    basic.imageUrl = toSampleImage('https://picsum.photos/240?random=11', 'basic-sample')
    state.imageUrl = toSampleImage('https://picsum.photos/240?random=12', 'state-sample')
    multiple.images = [
        toSampleImage('https://picsum.photos/240?random=21', 'multiple-sample-1'),
        toSampleImage('https://picsum.photos/240?random=22', 'multiple-sample-2'),
        toSampleImage('https://picsum.photos/240?random=23', 'multiple-sample-3'),
    ]
    readMode.dataUrlImage = toSampleImage('https://picsum.photos/240?random=13', 'dataurl-sample')
    readMode.objectUrlImage = toSampleImage('https://picsum.photos/240?random=14', 'objecturl-sample')
    drop.enabled = toSampleImage('https://picsum.photos/240?random=15', 'drop-enabled-sample')
    rules.imageOnly = toSampleImage('https://picsum.photos/240?random=16', 'rules-image-sample')
    rules.maxSizeImage = toSampleImage('https://picsum.photos/240?random=17', 'rules-size-sample')
}

function clearBasic() {
    basic.imageUrl = null
}

function clearState() {
    state.imageUrl = null
}

function clearMultiple() {
    multiple.images = []
    multiple.files = []
}

function toggleDisabled() {
    state.disabled = !state.disabled
}

function onError(payload: { message: string; detail?: unknown }) {
    lastError.value = payload
}

function onRemove() {
    removedCount.value += 1
}

function resetAll() {
    basic.imageUrl = null
    basic.file = null

    state.imageUrl = null
    state.disabled = false
    state.file = null

    multiple.images = []
    multiple.files = []

    readMode.dataUrlImage = null
    readMode.objectUrlImage = null
    readMode.dataUrlFile = null
    readMode.objectUrlFile = null

    drop.enabled = null
    drop.disabled = null
    drop.enabledFile = null
    drop.disabledFile = null

    rules.imageOnly = null
    rules.maxSizeImage = null
    rules.imageOnlyFile = null
    rules.maxSizeFile = null

    lastError.value = null
    removedCount.value = 0
}

const output = computed(() =>
    JSON.stringify(
        {
            basic: {
                imageUrl: basic.imageUrl ? '(set)' : '',
                file: basic.file,
            },
            state: {
                imageUrl: state.imageUrl ? '(set)' : '',
                disabled: state.disabled,
                file: state.file,
            },
            multiple: {
                images: multiple.images.length,
                files: multiple.files,
            },
            readMode: {
                dataUrlImage: readMode.dataUrlImage ? '(set)' : '',
                objectUrlImage: readMode.objectUrlImage ? '(set)' : '',
                dataUrlFile: readMode.dataUrlFile,
                objectUrlFile: readMode.objectUrlFile,
            },
            drop: {
                enabled: drop.enabled ? '(set)' : '',
                disabled: drop.disabled ? '(set)' : '',
                enabledFile: drop.enabledFile,
                disabledFile: drop.disabledFile,
            },
            rules: {
                imageOnly: rules.imageOnly ? '(set)' : '',
                maxSizeImage: rules.maxSizeImage ? '(set)' : '',
                maxSizeBytes: rules.maxSizeBytes,
                imageOnlyFile: rules.imageOnlyFile,
                maxSizeFile: rules.maxSizeFile,
            },
            lastError: lastError.value,
            removedCount: removedCount.value,
        },
        null,
        2,
    ),
)
</script>

<!-- demo 공통 스타일은 assets/scss/main.scss 로 이동 -->