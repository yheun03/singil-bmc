<template>
    <div ref="root" class="app-grid-search" @keydown.enter.prevent="applySearch" @change="handleAutoSearch">
        <template v-for="f in fields" :key="fieldKey(f)">
            <dl v-if="layoutType(f) === 'input'" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd">
                    <AppInput size="sm" :name="f.field" :model-value="stringField(f.field)" :type="inputNativeType(f)"
                        :placeholder="f.placeholder" :readonly="f.readonly" :disabled="f.disabled"
                        @update:model-value="(v) => setField(f.field, v)" />
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'textarea'" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd">
                    <AppTextarea size="sm" :model-value="stringField(f.field)" :rows="f.rows ?? 3"
                        :placeholder="f.placeholder" :readonly="f.readonly" :disabled="f.disabled"
                        @update:model-value="(v) => setField(f.field, v)" />
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'number_range' && f.numberRange" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd app-grid-search__dd--inline">
                    <AppInput size="sm" type="number" :name="f.numberRange.minKey"
                        :model-value="stringField(f.numberRange.minKey)" :placeholder="'최소'" :min="f.inputMin"
                        :max="f.inputMax" :step="f.step" :readonly="f.readonly" :disabled="f.disabled"
                        class="app-grid-search__range-part"
                        @update:model-value="(v) => setField(f.numberRange!.minKey, v)" />
                    <span class="app-grid-search__range-sep">~</span>
                    <AppInput size="sm" type="number" :name="f.numberRange.maxKey"
                        :model-value="stringField(f.numberRange.maxKey)" :placeholder="'최대'" :min="f.inputMin"
                        :max="f.inputMax" :step="f.step" :readonly="f.readonly" :disabled="f.disabled"
                        class="app-grid-search__range-part"
                        @update:model-value="(v) => setField(f.numberRange!.maxKey, v)" />
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'split_inputs' && f.splitInput?.keys?.length" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd app-grid-search__dd--inline">
                    <template v-for="(sk, i) in f.splitInput.keys" :key="sk">
                        <AppInput size="sm" :name="sk" :model-value="stringField(sk)"
                            :placeholder="f.splitInput.placeholders?.[i] ?? ''" :readonly="f.readonly"
                            :disabled="f.disabled" class="app-grid-search__split-part"
                            @update:model-value="(v) => setField(sk, v)" />
                        <span v-if="rawFieldType(f) === 'email' && i < f.splitInput.keys.length - 1"
                            class="app-grid-search__split-sep">@</span>
                    </template>
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'input_button'" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd app-grid-search__dd--inline">
                    <AppInput size="sm" :name="f.field" :model-value="stringField(f.field)" :type="inputNativeType(f)"
                        :placeholder="f.placeholder" :readonly="f.readonly" :disabled="f.disabled"
                        class="app-grid-search__select-input-text" @update:model-value="(v) => setField(f.field, v)" />
                    <AppButton size="sm" variant="outline" type="button" :disabled="f.disabled"
                        @click="emitFieldAction(f)">
                        {{ f.buttonText ?? '실행' }}
                    </AppButton>
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'input_text_row'" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd app-grid-search__dd--inline">
                    <AppInput size="sm" :name="f.field" :model-value="stringField(f.field)" :type="inputNativeType(f)"
                        :placeholder="f.placeholder" :readonly="f.readonly" :disabled="f.disabled"
                        class="app-grid-search__select-input-text" @update:model-value="(v) => setField(f.field, v)" />
                    <span v-if="f.suffixText" class="app-grid-search__suffix">{{ f.suffixText }}</span>
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'text_button'" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd app-grid-search__dd--inline">
                    <span class="app-grid-search__suffix">{{ f.suffixText ?? stringField(f.field) }}</span>
                    <AppButton size="sm" variant="outline" type="button" :disabled="f.disabled"
                        @click="emitFieldAction(f)">
                        {{ f.buttonText ?? '실행' }}
                    </AppButton>
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'select' && f.options?.length" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd">
                    <AppSelect size="sm" :name="f.field" :model-value="selectField(f.field)" :options="f.options"
                        :placeholder="f.placeholderSelect ?? f.placeholder ?? '선택하세요'" :readonly="f.readonly"
                        :disabled="f.disabled" @update:model-value="(v) => setField(f.field, v)"
                        @change="applySearch" />
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'select_input' && f.selectInput" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd app-grid-search__dd--inline">
                    <AppSelect size="sm" :name="f.selectInput.columnKey"
                        :model-value="selectField(f.selectInput.columnKey)" :options="f.selectInput.options"
                        :placeholder="f.placeholderSelect ?? '컬럼'" class="app-grid-search__select-input-select"
                        @update:model-value="(v) => setField(f.selectInput!.columnKey, v)" @change="applySearch" />
                    <AppInput size="sm" :name="f.selectInput.textKey" :model-value="stringField(f.selectInput.textKey)"
                        :placeholder="f.placeholderInput ?? f.placeholder ?? '검색어'"
                        class="app-grid-search__select-input-text"
                        @update:model-value="(v) => setField(f.selectInput!.textKey, v)" />
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'radio' && f.options?.length" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd">
                    <div class="app-grid-search__choices">
                        <AppChoice v-for="opt in f.options" :key="String(opt.value)" size="sm"
                            :model-value="choiceScalar(f.field)" type="radio" :name="f.field" :value="opt.value"
                            :label="opt.label" :disabled="opt.disabled"
                            @update:model-value="(v) => setField(f.field, v)" />
                    </div>
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'checkbox' && f.options?.length" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd">
                    <div class="app-grid-search__choices">
                        <AppChoice v-for="opt in f.options" :key="String(opt.value)" size="sm" type="checkbox"
                            :model-value="includesCheckbox(f.field, opt.value)" :label="opt.label"
                            :disabled="opt.disabled"
                            @update:model-value="(checked) => toggleCheckbox(f.field, opt.value, checked)" />
                    </div>
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'toggle'" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd">
                    <AppChoice size="sm" type="checkbox" :model-value="booleanField(f.field)" :disabled="f.disabled"
                        :readonly="f.readonly" @update:model-value="(v) => setField(f.field, v)" />
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'calendar'" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd">
                    <AppDatePicker size="sm" :model-value="calendarField(f.field)" mode="single" :min="f.min"
                        :max="f.max" :placeholder="f.placeholder ?? '날짜 선택'" :disabled="f.disabled"
                        :readonly="f.readonly" @update:model-value="(v) => setField(f.field, v)" />
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'range_calendar'" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd">
                    <AppDatePicker size="sm" :model-value="rangeField(f.field)" mode="range"
                        :placeholder="f.placeholder ?? '기간 선택'" :disabled="f.disabled" :readonly="f.readonly"
                        @update:model-value="(v) => setField(f.field, v)" />
                </dd>
            </dl>

            <dl v-else-if="layoutType(f) === 'range_calendar_minmax'" class="app-grid-search__dl">
                <dt class="app-grid-search__dt">{{ f.label }}</dt>
                <dd class="app-grid-search__dd">
                    <AppDatePicker size="sm" :model-value="rangeField(f.field)" mode="range" :min="f.min" :max="f.max"
                        :placeholder="f.placeholder ?? '기간 선택 (min/max)'" :disabled="f.disabled" :readonly="f.readonly"
                        @update:model-value="(v) => setField(f.field, v)" />
                </dd>
            </dl>
        </template>

        <slot />

        <div class="app-grid-search__actions">
            <AppButton size="sm" variant="outline" @click="applySearch">검색</AppButton>
            <AppButton size="sm" variant="outline" @click="resetGrid">초기화</AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { DateRangeValue } from '~/components/AppDatePicker.vue'
import type { AppGridSearchField } from '~/types/grid-search'
import { useAgGridRegistry } from '~/composables/useAgGridRegistry'

const props = withDefaults(
    defineProps<{
        fields?: AppGridSearchField[]
    }>(),
    {
        fields: () => []
    }
)

const emit = defineEmits<{
    (e: 'field-action', field: AppGridSearchField): void
}>()

const model = defineModel<Record<string, unknown>>({
    default: () => ({})
})

const target = inject<string>('appGridTarget')

const root = ref<HTMLElement | null>(null)

const { getApi } = useAgGridRegistry()

function fieldKey(f: AppGridSearchField) {
    return f.id ?? f.field
}

function rawFieldType(f: AppGridSearchField) {
    return f.type ?? 'input'
}

/** 템플릿 분기용 — AppGridSearchFieldType 별칭·복합 UI 정규화 */
function layoutType(f: AppGridSearchField): string {
    const raw = rawFieldType(f)
    if (raw === 'text') return 'input'
    if (raw === 'number' || raw === 'decimal' || raw === 'time' || raw === 'datetime') return 'input'
    if (raw === 'date') return 'calendar'
    if (raw === 'range_date') return 'range_calendar'
    if (raw === 'switch') return 'toggle'
    if (raw === 'multiselect') return 'checkbox'
    if (raw === 'textarea') return 'textarea'
    if (raw === 'number_range') return 'number_range'
    if (raw === 'email' || raw === 'phone') return 'split_inputs'
    if (raw === 'input_button') return 'input_button'
    if (raw === 'input_text' || raw === 'input_button_text') return 'input_text_row'
    if (raw === 'text_button') return 'text_button'
    return raw
}

function inputNativeType(f: AppGridSearchField): string {
    if (f.inputType) return f.inputType
    const raw = rawFieldType(f)
    if (raw === 'number') return 'number'
    if (raw === 'decimal') return 'text'
    return 'text'
}

function emitFieldAction(f: AppGridSearchField) {
    emit('field-action', f)
}

function modelKeysForField(f: AppGridSearchField): string[] {
    if (f.selectInput) {
        return [f.selectInput.columnKey, f.selectInput.textKey]
    }

    if (f.numberRange) {
        return [f.numberRange.minKey, f.numberRange.maxKey]
    }

    if (f.splitInput?.keys?.length) {
        return [...f.splitInput.keys]
    }

    return [f.field]
}

function stringField(key: string): string {
    const v = model.value[key]
    if (v === null || v === undefined) return ''
    return String(v)
}

function selectField(key: string): string | number | boolean | null {
    const v = model.value[key]
    if (v === undefined) return null
    return v as string | number | boolean
}

function choiceScalar(key: string): string | number | boolean | null {
    const v = model.value[key]
    if (v === undefined || v === null) return null
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v
    return null
}

function booleanField(key: string): boolean {
    return Boolean(model.value[key])
}

function calendarField(key: string): string | null {
    const v = model.value[key]
    if (v === null || v === undefined) return null
    if (typeof v === 'string') return v
    return null
}

function rangeField(key: string): DateRangeValue | null {
    const v = model.value[key]
    if (v && typeof v === 'object' && 'start' in (v as object) && 'end' in (v as object)) {
        return v as DateRangeValue
    }

    return null
}

function includesCheckbox(field: string, optionValue: string | number): boolean {
    const cur = model.value[field]
    if (!Array.isArray(cur)) return false
    return cur.includes(optionValue)
}

function setField(key: string, v: unknown) {
    model.value[key] = v
}

function toggleCheckbox(field: string, optionValue: string | number, checked: unknown) {
    const cur = model.value[field]
    const next = Array.isArray(cur) ? [...cur] : []

    if (checked) {
        if (!next.includes(optionValue)) next.push(optionValue)
    } else {
        const i = next.indexOf(optionValue)
        if (i > -1) next.splice(i, 1)
    }

    model.value[field] = next
}

function handleAutoSearch(e: Event) {
    const el = e.target as HTMLInputElement | HTMLSelectElement
    if (!el) return

    const isAuto =
        el.type === 'radio' ||
        el.type === 'checkbox' ||
        el.tagName === 'SELECT'

    if (!isAuto) return

    applySearch()
}

function dateEqualsModel(dateStr: string) {
    return {
        filterType: 'date',
        type: 'equals',
        dateFrom: `${dateStr} 00:00:00`
    }
}

function dateInRangeModel(start: string, end: string) {
    return {
        filterType: 'date',
        type: 'inRange',
        dateFrom: `${start} 00:00:00`,
        dateTo: `${end} 23:59:59`
    }
}

function buildFilterFromFields(): Record<string, unknown> {
    const filterModel: Record<string, unknown> = {}

    for (const f of props.fields) {
        const raw = rawFieldType(f)
        const colKey = f.filterField ?? f.field

        if (raw === 'textarea' || raw === 'text' || raw === 'input' || raw === 'time' || raw === 'datetime') {
            const v = model.value[f.field]
            if (v === undefined || v === null) continue
            const str = String(v).trim()
            if (!str) continue
            filterModel[colKey] = { filterType: 'text', type: 'contains', filter: str }
            continue
        }

        if (raw === 'number' || raw === 'decimal') {
            const v = model.value[f.field]
            const n = Number(v)
            if (Number.isNaN(n)) continue
            filterModel[colKey] = { filterType: 'number', type: 'equals', filter: n }
            continue
        }

        if ((raw === 'email' || raw === 'phone') && f.splitInput?.keys?.length) {
            const parts = f.splitInput.keys.map((key) => String(model.value[key] ?? '').trim())
            if (!parts.some(Boolean)) continue
            const joined = raw === 'email' ? parts.join('@') : parts.join('')
            if (!joined.trim()) continue
            filterModel[colKey] = { filterType: 'text', type: 'contains', filter: joined.trim() }
            continue
        }

        if (raw === 'multiselect' || raw === 'checkbox') {
            const key = f.field
            const fk = f.filterField ?? f.field
            const arr = model.value[key]
            if (!Array.isArray(arr) || arr.length === 0) continue

            if (f.setFilter) {
                filterModel[fk] = { filterType: 'set', values: arr.map((x) => String(x)) }
            } else {
                filterModel[fk] = { filterType: 'text', type: 'equals', filter: arr[0] }
            }

            continue
        }

        if (raw === 'number_range' && f.numberRange) {
            const a = Number(model.value[f.numberRange.minKey])
            const b = Number(model.value[f.numberRange.maxKey])
            const hasA = !Number.isNaN(a)
            const hasB = !Number.isNaN(b)
            if (!hasA && !hasB) continue

            if (hasA && hasB) {
                const lo = Math.min(a, b)
                const hi = Math.max(a, b)
                filterModel[colKey] = { filterType: 'number', type: 'inRange', filter: lo, filterTo: hi }
            } else if (hasA) {
                filterModel[colKey] = { filterType: 'number', type: 'greaterThanOrEqual', filter: a }
            } else {
                filterModel[colKey] = { filterType: 'number', type: 'lessThanOrEqual', filter: b }
            }

            continue
        }

        if (raw === 'input_button' || raw === 'input_text' || raw === 'input_button_text') {
            const v = model.value[f.field]
            if (v === undefined || v === null) continue
            const str = String(v).trim()
            if (!str) continue
            filterModel[colKey] = { filterType: 'text', type: 'contains', filter: str }
            continue
        }

        if (raw === 'text_button') {
            const v = f.suffixText ?? model.value[f.field]
            if (v === undefined || v === null) continue
            const str = String(v).trim()
            if (!str) continue
            filterModel[colKey] = { filterType: 'text', type: 'contains', filter: str }
            continue
        }

        if (raw === 'select') {
            const v = model.value[f.field]
            if (v === undefined || v === null || v === '') continue
            if (f.setFilter) {
                filterModel[colKey] = { filterType: 'set', values: [String(v)] }
            } else {
                filterModel[colKey] = { filterType: 'text', type: 'equals', filter: v }
            }

            continue
        }

        if (raw === 'select_input' && f.selectInput) {
            const col = model.value[f.selectInput.columnKey]
            const textRaw = model.value[f.selectInput.textKey]
            if (col === undefined || col === null || col === '') continue
            const colStr = String(col).trim()
            const text = typeof textRaw === 'string' ? textRaw.trim() : String(textRaw ?? '').trim()
            if (!text) continue

            const useNumber =
                f.numberFilterFields?.includes(colStr) ||
                f.numberFilterFields?.includes(String(col))

            if (useNumber) {
                const n = Number(text)
                if (Number.isNaN(n)) continue
                filterModel[colStr] = { filterType: 'number', type: 'equals', filter: n }
            } else {
                filterModel[colStr] = { filterType: 'text', type: 'contains', filter: text }
            }

            continue
        }

        if (raw === 'radio') {
            const v = model.value[f.field]
            if (v === undefined || v === null) continue
            const str = String(v).trim()
            if (!str) continue
            filterModel[colKey] = { filterType: 'text', type: 'equals', filter: v }
            continue
        }

        if (raw === 'toggle' || raw === 'switch') {
            const fk = f.filterField ?? f.field
            if (model.value[f.field] !== true) continue
            filterModel[fk] = { filterType: 'text', type: 'equals', filter: 'Y' }
            continue
        }

        if (raw === 'calendar' || raw === 'date') {
            const v = model.value[f.field]
            if (v === undefined || v === null || v === '') continue
            const dateStr = String(v).trim()
            if (!dateStr) continue
            filterModel[colKey] = dateEqualsModel(dateStr)
            continue
        }

        if (raw === 'range_calendar' || raw === 'range_date' || raw === 'range_calendar_minmax') {
            const v = model.value[f.field] as DateRangeValue | null | undefined
            if (!v?.start || !v?.end) continue
            const a = String(v.start).trim()
            const b = String(v.end).trim()
            if (!a || !b) continue
            const [start, end] = a <= b ? [a, b] : [b, a]
            filterModel[colKey] = dateInRangeModel(start, end)
        }
    }

    return filterModel
}

function buildFilterFromDom(managedNames?: Set<string>): Record<string, { type: string; filter: string }> {
    const filterModel: Record<string, { type: string; filter: string }> = {}

    const inputs =
        root.value?.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[name]')

    if (!inputs) return filterModel

    inputs.forEach((input: any) => {
        const field = input.name
        if (managedNames?.has(field)) return
        let value = ''

        if (input.type === 'radio') {
            if (!input.checked) return
            value = input.value
        } else {
            value = input.value?.trim()
        }

        if (!value) return

        const isExact =
            input.type === 'radio' ||
            input.tagName === 'SELECT'

        filterModel[field] = {
            type: isExact ? 'equals' : 'contains',
            filter: value
        }
    })

    return filterModel
}

function allManagedKeys(): Set<string> {
    const s = new Set<string>()
    for (const f of props.fields) {
        for (const k of modelKeysForField(f)) s.add(k)
    }

    return s
}

function applySearch() {
    if (!target) return

    const api = getApi(target)
    if (!api) return

    const managed = allManagedKeys()

    let filterModel: Record<string, unknown> = {}

    if (props.fields.length) {
        filterModel = { ...buildFilterFromFields() }
    }

    const domPart = buildFilterFromDom(props.fields.length ? managed : undefined) as Record<string, unknown>
    filterModel = { ...filterModel, ...domPart }

    api.setFilterModel(Object.keys(filterModel).length ? filterModel : null)
    api.onFilterChanged()
}

function resetGrid() {
    if (!target) return

    const api = getApi(target)
    if (!api) return

    api.setFilterModel(null)
    api.deselectAll()

    if (props.fields.length) {
        const next = { ...model.value }
        for (const f of props.fields) {
            if (f.selectInput) {
                const si = f.selectInput
                const first = si.options[0]?.value
                next[si.columnKey] = first !== undefined ? first : null
                next[si.textKey] = ''
                continue
            }

            if (f.numberRange) {
                next[f.numberRange.minKey] = ''
                next[f.numberRange.maxKey] = ''
                continue
            }

            if (f.splitInput?.keys?.length) {
                for (const sk of f.splitInput.keys) {
                    next[sk] = ''
                }
                continue
            }

            const k = f.field
            const raw = rawFieldType(f)
            if (raw === 'checkbox' || raw === 'multiselect') next[k] = []
            else if (raw === 'toggle' || raw === 'switch') next[k] = false
            else if (raw === 'select') next[k] = null
            else if (raw === 'calendar' || raw === 'date') next[k] = null
            else if (raw === 'range_calendar' || raw === 'range_date' || raw === 'range_calendar_minmax') {
                next[k] = null
            } else {
                next[k] = ''
            }
        }

        model.value = next
    }

    const inputs =
        root.value?.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[name]')

    if (!inputs) return

    const managed = allManagedKeys()

    inputs.forEach((input: any) => {
        if (managed.has(input.name)) return

        if (input.type === 'radio' || input.type === 'checkbox') {
            input.checked = false
        } else {
            input.value = ''
        }
    })
}
</script>

<style scoped lang="scss">
.app-grid-search {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0.75rem 1rem;
}

.app-grid-search__dl {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem 0.6rem;
    margin: 0;
}

.app-grid-search__dt {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-muted, #64748b);
    white-space: nowrap;
}

.app-grid-search__dd {
    margin: 0;
    min-width: 0;
}

.app-grid-search__dd--inline {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0.5rem;
}

.app-grid-search__select-input-select {
    flex: 0 1 8.5rem;
    min-width: 6rem;
}

.app-grid-search__select-input-text {
    flex: 1 1 10rem;
    min-width: 8rem;
}

.app-grid-search__choices {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
}

.app-grid-search__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
}

.app-grid-search__range-part {
    flex: 1 1 5.5rem;
    min-width: 4rem;
}

.app-grid-search__range-sep {
    font-size: 0.8125rem;
    color: var(--color-text-muted, #64748b);
    padding: 0 0.15rem;
}

.app-grid-search__split-part {
    flex: 1 1 6rem;
    min-width: 4rem;
}

.app-grid-search__split-sep {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-muted, #64748b);
}

.app-grid-search__suffix {
    font-size: 0.8125rem;
    color: var(--color-text-muted, #64748b);
    white-space: nowrap;
}
</style>
