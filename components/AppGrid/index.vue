<template>
    <AgGridVue v-bind="gridAttrs" :locale-text="localeText" :class="['ag-theme-quartz', attrs.class]"
        @grid-ready="onGridReady" />
</template>

<script setup lang="ts">
defineOptions({
    ssr: false
})
import { AgGridVue } from 'ag-grid-vue3'
import type { GridOptions, GridReadyEvent, FilterChangedEvent } from 'ag-grid-community'
import { useAgGridRegistry } from '~/composables/useAgGridRegistry'

const { register } = useAgGridRegistry()

const { $agGridLocale } = useNuxtApp()
const attrs = useAttrs()

function onGridReady(e: GridReadyEvent) {

    const id = e.api.getGridId()

    if (!id) {
        console.warn('gridId missing')
        return
    }

    register(id, e.api)
}

/* attrs -> grid-id 전달 */

const gridAttrs = computed(() => {

    const a = attrs as Record<string, any>

    const {
        localeText: _,
        class: __,
        gridId,
        'grid-id': gridIdKebab,
        ...rest
    } = a

    const id = gridId ?? gridIdKebab

    return {

        overlayLoadingTemplate:
            '<div class="ag-overlay-loading">로딩중...</div>',

        overlayNoRowsTemplate:
            '<div class="ag-overlay-no-rows">검색된 결과가 없습니다</div>',

        rowHeight: rest.rowHeight ?? 42,
        getRowHeight: rest.getRowHeight,

        onFilterChanged(params: FilterChangedEvent) {

            const api = params.api

            if (api.getDisplayedRowCount() === 0 && api.isAnyFilterPresent()) {
                api.showNoRowsOverlay()
            } else {
                api.hideOverlay()
            }

        },

        ...rest,
        gridId: id
    }

})

const localeText = computed<GridOptions['localeText']>(() => {
    return (attrs.localeText as GridOptions['localeText']) ?? $agGridLocale
})
</script>