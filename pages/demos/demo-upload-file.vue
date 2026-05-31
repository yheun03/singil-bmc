<template>
    <div class="page-demo">
        <div class="page-demo-layout">
            <main class="page-demo-main">
                <header class="page-demo__header">
                    <h1 class="page-demo__title">{{ title }}</h1>
                    <p class="page-demo__desc">{{ description }}</p>
                </header>

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Basic</h2>
                    <p class="page-demo-card__desc">
                        가장 기본적인 단일 파일 업로드 예시입니다. PDF 파일은 항목의 미리보기 버튼으로 PDF 뷰어 모달을 열 수 있습니다.
                    </p>

                    <div class="page-demo-row">
                        <AppUploadFile v-model="basic.file" @change="onBasicChange" @error="onError"
                            @remove="onRemove" />

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">
                                단일 파일 업로드용 기본 예시입니다.
                            </div>

                            <div class="page-demo-actions">
                                <AppButton size="sm" variant="outline" @click="setBasicSample">
                                    샘플 파일
                                </AppButton>

                                <AppButton size="sm" variant="text" :disabled="!basic.file" @click="clearBasic">
                                    값 비우기
                                </AppButton>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Multiple</h2>
                    <p class="page-demo-card__desc">
                        여러 파일을 업로드하고 최대 개수 제한을 적용하는 예시입니다.
                    </p>

                    <div class="page-demo-row">
                        <AppUploadFile v-model="multiple.files" multiple :max-count="4" @change="onMultipleChange"
                            @error="onError" @remove="onRemove" />

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">
                                최대 4개까지 업로드할 수 있습니다.
                            </div>

                            <div class="page-demo-actions">
                                <AppButton size="sm" variant="outline" @click="setMultipleSamples">
                                    샘플 파일
                                </AppButton>

                                <AppButton size="sm" variant="text" :disabled="!multiple.files.length"
                                    @click="clearMultiple">
                                    값 비우기
                                </AppButton>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Drag & Drop</h2>
                    <p class="page-demo-card__desc">
                        <code>allowDrop</code> 속성으로 드래그 앤 드롭 허용 여부를 제어합니다.
                    </p>

                    <div class="page-demo-grid">
                        <div class="page-demo-stack">
                            <AppUploadFile v-model="drop.enabled" :allow-drop="true" @change="onDropEnabledChange"
                                @error="onError" />

                            <div class="page-demo-hint">
                                드롭 가능 상태입니다.
                            </div>
                        </div>

                        <div class="page-demo-stack">
                            <AppUploadFile v-model="drop.disabled" :allow-drop="false" @change="onDropDisabledChange"
                                @error="onError" />

                            <div class="page-demo-hint">
                                드롭 비허용 상태입니다.
                            </div>
                        </div>
                    </div>
                </section>

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">File Rules</h2>
                    <p class="page-demo-card__desc">
                        파일 형식과 최대 용량 제한 예시입니다.
                    </p>

                    <div class="page-demo-grid">
                        <div class="page-demo-stack">
                            <AppUploadFile v-model="rules.docsOnly" accept=".pdf,.doc,.docx,.xls,.xlsx"
                                @change="onRulesDocsChange" @error="onError" />

                            <div class="page-demo-hint">
                                <strong>accept</strong> 속성으로 문서 형식만 허용합니다.
                            </div>
                        </div>

                        <div class="page-demo-stack">
                            <AppUploadFile v-model="rules.maxSizeFile" :max-size-bytes="rules.maxSizeBytes"
                                @change="onRulesSizeChange" @error="onError" />

                            <div class="page-demo-hint">
                                <strong>maxSizeBytes</strong> 속성으로 최대 용량을 제한합니다.
                            </div>
                        </div>
                    </div>
                </section>

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Disabled</h2>
                    <p class="page-demo-card__desc">
                        비활성 상태에서 선택/드롭을 막는 예시입니다.
                    </p>

                    <div class="page-demo-row">
                        <AppUploadFile v-model="disabled.file" :disabled="disabled.value" @change="onDisabledChange"
                            @error="onError" />

                        <div class="page-demo-stack">
                            <div class="page-demo-actions">
                                <AppButton size="sm" variant="text" @click="toggleDisabled">
                                    disabled: {{ disabled.value ? 'ON' : 'OFF' }}
                                </AppButton>

                                <AppButton size="sm" variant="text" :disabled="!disabled.file" @click="clearDisabled">
                                    값 비우기
                                </AppButton>
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
                                샘플 파일 일괄 적용
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
const { title, description } = useDemoI18n('uploadFile')

type FileMeta = {
    name: string
    type: string
    size: number
    lastModified?: number
    path?: string
    source?: 'sample' | 'upload'
}

type UploadFileItem = {
    id: string
    name: string
    type: string
    size: number
    path?: string
    file?: File
    source?: 'sample' | 'upload'
}

const basic = reactive({
    file: null as UploadFileItem | null,
    meta: null as FileMeta | null,
})

const multiple = reactive({
    files: [] as UploadFileItem[],
    metas: [] as FileMeta[],
})

const drop = reactive({
    enabled: null as UploadFileItem | null,
    disabled: null as UploadFileItem | null,
    enabledMeta: null as FileMeta | null,
    disabledMeta: null as FileMeta | null,
})

const rules = reactive({
    docsOnly: null as UploadFileItem | null,
    maxSizeFile: null as UploadFileItem | null,
    maxSizeBytes: 5 * 1024 * 1024,
    docsOnlyMeta: null as FileMeta | null,
    maxSizeMeta: null as FileMeta | null,
})

const disabled = reactive({
    file: null as UploadFileItem | null,
    value: true,
    meta: null as FileMeta | null,
})

const lastError = ref<{ message: string; detail?: unknown } | null>(null)
const removedCount = ref(0)

function toMeta(item: UploadFileItem): FileMeta {
    if (item.file) {
        return {
            name: item.file.name,
            type: item.file.type,
            size: item.file.size,
            lastModified: item.file.lastModified,
            source: item.source,
        }
    }

    return {
        name: item.name,
        type: item.type,
        size: item.size,
        path: item.path,
        source: item.source,
    }
}

function toSampleFile(name: string, type: string, size: number, path: string) {
    return {
        id: `sample-${name}`,
        name,
        type,
        size,
        path,
        source: 'sample' as const,
    } satisfies UploadFileItem
}

function updateMeta(item: UploadFileItem | UploadFileItem[] | null, assign: (meta: FileMeta | null) => void) {
    const nextItem = Array.isArray(item) ? item[0] ?? null : item
    assign(nextItem ? toMeta(nextItem) : null)
    lastError.value = null
}

function updateMetaList(item: UploadFileItem | UploadFileItem[] | null, assign: (meta: FileMeta[]) => void) {
    const nextItems = Array.isArray(item)
        ? item
        : item ? [item] : []

    assign(nextItems.map(toMeta))
    lastError.value = null
}

function onBasicChange(item: UploadFileItem | UploadFileItem[] | null) {
    updateMeta(item, (meta) => { basic.meta = meta })
}

function onMultipleChange(item: UploadFileItem | UploadFileItem[] | null) {
    updateMetaList(item, (meta) => { multiple.metas = meta })
}

function onDropEnabledChange(item: UploadFileItem | UploadFileItem[] | null) {
    updateMeta(item, (meta) => { drop.enabledMeta = meta })
}

function onDropDisabledChange(item: UploadFileItem | UploadFileItem[] | null) {
    updateMeta(item, (meta) => { drop.disabledMeta = meta })
}

function onRulesDocsChange(item: UploadFileItem | UploadFileItem[] | null) {
    updateMeta(item, (meta) => { rules.docsOnlyMeta = meta })
}

function onRulesSizeChange(item: UploadFileItem | UploadFileItem[] | null) {
    updateMeta(item, (meta) => { rules.maxSizeMeta = meta })
}

function onDisabledChange(item: UploadFileItem | UploadFileItem[] | null) {
    updateMeta(item, (meta) => { disabled.meta = meta })
}

function setBasicSample() {
    basic.file = toSampleFile('project-overview.pdf', 'application/pdf', 240000, '/samples/project-overview.pdf')
}

function setMultipleSamples() {
    multiple.files = [
        toSampleFile('contract.pdf', 'application/pdf', 180000, '/samples/contract.pdf'),
        toSampleFile('budget.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 92000, '/samples/budget.xlsx'),
        toSampleFile('notes.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 76000, '/samples/notes.docx'),
    ]
}

function setAllSamples() {
    basic.file = toSampleFile('project-overview.pdf', 'application/pdf', 240000, '/samples/project-overview.pdf')
    multiple.files = [
        toSampleFile('contract.pdf', 'application/pdf', 180000, '/samples/contract.pdf'),
        toSampleFile('budget.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 92000, '/samples/budget.xlsx'),
        toSampleFile('notes.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 76000, '/samples/notes.docx'),
    ]
    drop.enabled = toSampleFile('drop-guide.pdf', 'application/pdf', 120000, '/samples/drop-guide.pdf')
    rules.docsOnly = toSampleFile('manual.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 68000, '/samples/manual.docx')
    rules.maxSizeFile = toSampleFile('report.pdf', 'application/pdf', 440000, '/samples/report.pdf')
}

function clearBasic() {
    basic.file = null
    basic.meta = null
}

function clearMultiple() {
    multiple.files = []
    multiple.metas = []
}

function clearDisabled() {
    disabled.file = null
    disabled.meta = null
}

function toggleDisabled() {
    disabled.value = !disabled.value
}

function onError(payload: { message: string; detail?: unknown }) {
    lastError.value = payload
}

function onRemove() {
    removedCount.value += 1
}

function resetAll() {
    basic.file = null
    basic.meta = null

    multiple.files = []
    multiple.metas = []

    drop.enabled = null
    drop.disabled = null
    drop.enabledMeta = null
    drop.disabledMeta = null

    rules.docsOnly = null
    rules.maxSizeFile = null
    rules.docsOnlyMeta = null
    rules.maxSizeMeta = null

    disabled.file = null
    disabled.value = true
    disabled.meta = null

    lastError.value = null
    removedCount.value = 0
}

const output = computed(() =>
    JSON.stringify(
        {
            basic: {
                file: basic.file ? '(set)' : '',
                meta: basic.meta,
            },
            multiple: {
                files: multiple.files.length,
                metas: multiple.metas,
            },
            drop: {
                enabled: drop.enabled ? '(set)' : '',
                disabled: drop.disabled ? '(set)' : '',
                enabledMeta: drop.enabledMeta,
                disabledMeta: drop.disabledMeta,
            },
            rules: {
                docsOnly: rules.docsOnly ? '(set)' : '',
                maxSizeFile: rules.maxSizeFile ? '(set)' : '',
                maxSizeBytes: rules.maxSizeBytes,
                docsOnlyMeta: rules.docsOnlyMeta,
                maxSizeMeta: rules.maxSizeMeta,
            },
            disabled: {
                file: disabled.file ? '(set)' : '',
                value: disabled.value,
                meta: disabled.meta,
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
