<template>
    <AgGridVue v-bind="gridAttrs" :locale-text="localeText" :class="['ag-theme-quartz', attrs.class]"
        @grid-ready="onGridReady" />
</template>

<script setup lang="ts">
defineOptions({
    ssr: false,
});
import { AgGridVue } from 'ag-grid-vue3';
import type {
    FilterChangedEvent,
    GridApi,
    GridOptions,
    GridReadyEvent,
    ModelUpdatedEvent,
    RowClassParams,
    SortChangedEvent,
} from 'ag-grid-community';
import { useAgGridRegistry } from '~/composables/useAgGridRegistry';
import {
    combineGridRowClass,
    enhanceGridColumnDefs,
    enhanceGridDefaultColDef,
    getGridRowStripeClass,
} from '~/utils/ag-grid-decimal';

const { register } = useAgGridRegistry();

const { $agGridLocale } = useNuxtApp();
const attrs = useAttrs();

function refreshRowStripes(api: GridApi) {
    api.redrawRows();
}

function onGridReady(e: GridReadyEvent) {
    const id = e.api.getGridId();

    if (!id) {
        console.warn('gridId missing');
    } else {
        register(id, e.api);
    }

    refreshRowStripes(e.api);

    const userHandler = (attrs as Record<string, unknown>)['onGridReady'] ?? (attrs as Record<string, unknown>)['on-grid-ready'];
    if (typeof userHandler === 'function') {
        userHandler(e);
    }
}

const gridAttrs = computed(() => {
    const a = attrs as Record<string, unknown>;

    const {
        localeText: _localeText,
        class: _class,
        gridId,
        'grid-id': gridIdKebab,
        columnDefs,
        'column-defs': columnDefsKebab,
        defaultColDef,
        'default-col-def': defaultColDefKebab,
        getRowClass,
        'get-row-class': getRowClassKebab,
        onFilterChanged,
        'on-filter-changed': onFilterChangedKebab,
        onSortChanged,
        'on-sort-changed': onSortChangedKebab,
        onModelUpdated,
        'on-model-updated': onModelUpdatedKebab,
        onGridReady: _onGridReady,
        'on-grid-ready': _onGridReadyKebab,
        ...rest
    } = a;

    const id = gridId ?? gridIdKebab;
    const rowData = (rest.rowData ?? rest['row-data']) as unknown[] | undefined;
    const userGetRowClass = (getRowClass ?? getRowClassKebab) as ((params: RowClassParams) => string | string[] | undefined) | undefined;
    const userOnFilterChanged = (onFilterChanged ?? onFilterChangedKebab) as ((event: FilterChangedEvent) => void) | undefined;
    const userOnSortChanged = (onSortChanged ?? onSortChangedKebab) as ((event: SortChangedEvent) => void) | undefined;
    const userOnModelUpdated = (onModelUpdated ?? onModelUpdatedKebab) as ((event: ModelUpdatedEvent) => void) | undefined;

    return {
        overlayLoadingTemplate: '<div class="ag-overlay-loading">로딩중...</div>',
        overlayNoRowsTemplate: '<div class="ag-overlay-no-rows">검색된 결과가 없습니다</div>',
        rowHeight: (rest.rowHeight as number | undefined) ?? 42,
        getRowHeight: rest.getRowHeight ?? rest['get-row-height'],
        columnDefs: enhanceGridColumnDefs((columnDefs ?? columnDefsKebab) as GridOptions['columnDefs'], rowData),
        defaultColDef: enhanceGridDefaultColDef((defaultColDef ?? defaultColDefKebab) as GridOptions['defaultColDef']),
        getRowClass: combineGridRowClass(getGridRowStripeClass, userGetRowClass),
        onFilterChanged(params: FilterChangedEvent) {
            const api = params.api;

            if (api.getDisplayedRowCount() === 0 && api.isAnyFilterPresent()) {
                api.showNoRowsOverlay();
            } else {
                api.hideOverlay();
            }

            refreshRowStripes(api);
            userOnFilterChanged?.(params);
        },
        onSortChanged(params: SortChangedEvent) {
            refreshRowStripes(params.api);
            userOnSortChanged?.(params);
        },
        onModelUpdated(params: ModelUpdatedEvent) {
            refreshRowStripes(params.api);
            userOnModelUpdated?.(params);
        },
        ...rest,
        gridId: id,
    };
});

const localeText = computed<GridOptions['localeText']>(() => {
    return (attrs.localeText as GridOptions['localeText']) ?? $agGridLocale;
});
</script>
