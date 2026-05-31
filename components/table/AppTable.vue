<template>
    <div class="app-table" :class="{
        'app-table--stacked': layout === 'stacked',
    }">
        <h2 v-if="title" class="app-table__title">
            {{ title }}
        </h2>

        <p v-if="description" class="app-table__description" v-html="description" />

        <div class="app-table__content">
            <table v-if="layout === 'inline'" class="app-table__table">
                <colgroup>
                    <col v-for="(width, index) in normalizedInlineColgroup" :key="`inline-col-${index}`"
                        :style="{ width }" />
                </colgroup>

                <tbody>
                    <tr v-for="(row, rowIndex) in normalizedRows" :key="row.id || rowIndex" class="app-table__row">
                        <template v-for="(cell, cellIndex) in row.cells"
                            :key="`${row.id || rowIndex}-${String(cell.key ?? cellIndex)}`">
                            <th v-if="showLabelCell(cell)" class="app-table__th" :class="cell.labelClass"
                                :colspan="getLabelColspan(cell)" :rowspan="getRowspan(cell)" scope="row">
                                {{ cell.label }}
                                <span v-if="cell.isRequired" class="app-table__required">*</span>
                            </th>

                            <td class="app-table__td" :class="getTdClasses(cell)" :colspan="getInlineValueColspan(cell)"
                                :rowspan="getRowspan(cell)">
                                <slot v-if="cell.slot" :name="cell.slot" :cell="cell" :row="row" :model="modelValue"
                                    :value="getModelValue(cell.key)" :update-value="createValueUpdater(cell.key)" />

                                <AppTableField v-else :cell="cell" :model-value="modelValue" :readonly="readonly"
                                    :disabled="disabled" @update-field="handleUpdateField"
                                    @field-action="emitFieldAction" />
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>

            <table v-else class="app-table__table app-table__table--stacked">
                <colgroup>
                    <col v-for="(width, index) in normalizedStackedColgroup" :key="`stacked-col-${index}`"
                        :style="{ width }" />
                </colgroup>

                <tbody>
                    <template v-for="(row, rowIndex) in normalizedRows" :key="row.id || rowIndex">
                        <tr class="app-table__row app-table__row--stacked-label">
                            <th v-for="(cell, cellIndex) in row.cells"
                                :key="`stacked-label-${row.id || rowIndex}-${String(cell.key ?? cellIndex)}`"
                                class="app-table__th app-table__th--stacked" :class="cell.labelClass"
                                :colspan="getStackedSpan(cell)" scope="col">
                                {{ cell.label }}
                                <span v-if="cell.isRequired" class="app-table__required">*</span>
                            </th>
                        </tr>

                        <tr class="app-table__row app-table__row--stacked-value">
                            <td v-for="(cell, cellIndex) in row.cells"
                                :key="`stacked-value-${row.id || rowIndex}-${String(cell.key ?? cellIndex)}`"
                                class="app-table__td app-table__td--stacked" :class="getTdClasses(cell)"
                                :colspan="getStackedSpan(cell)">
                                <slot v-if="cell.slot" :name="cell.slot" :cell="cell" :row="row" :model="modelValue"
                                    :value="getModelValue(cell.key)" :update-value="createValueUpdater(cell.key)" />

                                <AppTableField v-else :cell="cell" :model-value="modelValue" :readonly="readonly"
                                    :disabled="disabled" @update-field="handleUpdateField"
                                    @field-action="emitFieldAction" />
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { AppTableCell, AppTableRow } from '~/types/table';

type AppTableProps = {
    title?: string;
    description?: string;
    rows?: AppTableRow[];
    modelValue: Record<string, unknown>;
    colWidths?: string[];
    readonly?: boolean;
    disabled?: boolean;
    defaultLabelWidth?: string;
    layout?: 'inline' | 'stacked';
    stackedLabelWidth?: string;
};

const props = withDefaults(
    defineProps<AppTableProps>(),
    {
        title: '',
        description: '',
        rows: () => [],
        colWidths: () => [],
        readonly: false,
        disabled: false,
        defaultLabelWidth: '184px',
        layout: 'inline',
        stackedLabelWidth: 'auto',
    },
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, unknown>): void
    (e: 'field-action', cell: AppTableCell): void
}>()

function isVisible(target?: { visible?: boolean | ((model: Record<string, unknown>) => boolean) }) {
    if (typeof target?.visible === 'function') {
        return target.visible(props.modelValue)
    }

    if (typeof target?.visible === 'boolean') {
        return target.visible
    }

    return true
}

const normalizedRows = computed(() =>
    (props.rows || [])
        .filter((row) => isVisible(row))
        .map((row) => ({
            ...row,
            cells: (row.cells || []).filter((cell) => isVisible(cell)),
        }))
        .filter((row) => row.cells.length > 0),
)

function hasOwn(obj: Record<string, unknown>, key: string) {
    return Object.prototype.hasOwnProperty.call(obj || {}, key)
}

function getDefaultCells() {
    return normalizedRows.value
        .flatMap((row) => row.cells || [])
        .filter((cell) => cell?.key && cell.defaultValue !== undefined)
}

function getResolvedDefaultValue(cell: AppTableCell, model: Record<string, unknown>) {
    return typeof cell.defaultValue === 'function'
        ? cell.defaultValue(model, cell)
        : cell.defaultValue
}

function applyDefaultValues(model: Record<string, unknown> = {}) {
    const nextModel = { ...model }
    let changed = false

    getDefaultCells().forEach((cell) => {
        if (!cell.key) return

        const hasKey = hasOwn(nextModel, cell.key)

        if (!hasKey || nextModel[cell.key] == null) {
            nextModel[cell.key] = getResolvedDefaultValue(cell, nextModel)
            changed = true
        }
    })

    if (changed) {
        emit('update:modelValue', nextModel)
    }
}

const maxCellCount = computed(() => {
    return normalizedRows.value.reduce((max, row) => {
        const count = row.cells.reduce((sum, cell) => sum + Number(cell.colspan || 1), 0)
        return Math.max(max, count)
    }, 1)
})

const normalizedInlineColgroup = computed(() => {
    if (props.colWidths.length === maxCellCount.value * 2) {
        return props.colWidths
    }

    return Array.from({ length: maxCellCount.value }).flatMap(() => [
        props.defaultLabelWidth,
        '1fr',
    ])
})

const normalizedStackedColgroup = computed(() => {
    if (props.colWidths.length === maxCellCount.value) {
        return props.colWidths
    }

    return Array.from({ length: maxCellCount.value }, () => props.stackedLabelWidth)
})

function getModelValue(key?: string) {
    if (!key) return ''
    return props.modelValue?.[key] ?? ''
}

function updateFieldValue(key: string, value: unknown) {
    if (!key) return

    emit('update:modelValue', {
        ...props.modelValue,
        [key]: value,
    })
}

function createValueUpdater(key?: string) {
    return (value: unknown) => {
        if (!key) return
        updateFieldValue(key, value)
    }
}

function handleUpdateField(payload: { key: string; value: unknown }) {
    updateFieldValue(payload.key, payload.value)
}

function isReadonly(cell: AppTableCell) {
    return props.readonly || !!cell.readonly
}

function isDisabled(cell: AppTableCell) {
    return props.disabled || !!cell.disabled
}

function showLabelCell(cell: AppTableCell & { showLabel?: boolean }) {
    return !cell.full && cell.showLabel !== false
}

function getLabelColspan(cell: AppTableCell) {
    return Number(cell.labelColspan || 1)
}

function getRowspan(cell: AppTableCell) {
    return Number(cell.rowspan || 1)
}

function getStackedSpan(cell: AppTableCell) {
    return Number(cell.colspan || 1)
}

function getInlineValueColspan(cell: AppTableCell) {
    if (cell.full) {
        return maxCellCount.value * 2
    }

    const colspan = Number(cell.colspan || 1)
    const labelColspan = Number(cell.labelColspan || 1)

    return colspan * 2 - labelColspan
}

function getTdClasses(cell: AppTableCell) {
    return [
        cell.valueClass,
        {
            'is-full': cell.full,
            'is-readonly': isReadonly(cell),
            'is-disabled': isDisabled(cell),
            'is-textarea': cell.type === 'textarea',
        },
    ]
}

function emitFieldAction(cell: AppTableCell) {
    emit('field-action', cell)
}

watch(
    [normalizedRows, () => props.modelValue],
    () => {
        applyDefaultValues(props.modelValue || {})
    },
    { immediate: true },
)
</script>