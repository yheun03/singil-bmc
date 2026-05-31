import type { GridApi } from 'ag-grid-community';
import { useApi } from '~/composables/useApi';

type ExportColumn = { field: string; headerName: string };
type ExportRow = Record<string, unknown>;

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

function makeTimestamp() {
    const d = new Date();
    return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}_${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

function makeExportFileName(base: string) {
    return `${base}_${makeTimestamp()}`;
}

function getColumns<T>(api: GridApi<T>): ExportColumn[] {
    return api.getAllDisplayedColumns().map((col) => ({
        field: col.getColId(),
        headerName: (col.getColDef().headerName as string) || col.getColId(),
    }));
}

function getDisplayedRows<T>(api: GridApi<T>): ExportRow[] {
    const rows: ExportRow[] = [];
    const count = api.getDisplayedRowCount();
    for (let i = 0; i < count; i++) {
        const node = api.getDisplayedRowAtIndex(i);
        if (node?.data) rows.push(node.data as ExportRow);
    }
    return rows;
}

function getDisplayedSelectedRows<T>(api: GridApi<T>): ExportRow[] {
    const rows: ExportRow[] = [];
    const count = api.getDisplayedRowCount();
    for (let i = 0; i < count; i++) {
        const node = api.getDisplayedRowAtIndex(i);
        if (node?.isSelected() && node.data) rows.push(node.data as ExportRow);
    }
    return rows;
}

async function downloadBlobAsFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function useAgGridExcelExport(options?: { origin?: string }) {
    const origin = options?.origin ?? 'A1';
    const api = useApi();

    async function requestExcelDownload(params: {
        gridId: string;
        columns: ExportColumn[];
        rows: ExportRow[];
        fileNameBase?: string;
        sheetName?: string;
    }) {
        const fileNameBase = params.fileNameBase ?? params.gridId;
        const fileName = makeExportFileName(fileNameBase);
        const sheetName = params.sheetName ?? params.gridId;

        const res = await api.post<Blob>(
            '/api/export/excel',
            {
                gridId: params.gridId,
                columns: params.columns,
                rows: params.rows,
                fileName,
                sheetName,
                origin,
            },
            { responseType: 'blob' },
        );

        await downloadBlobAsFile(res, `${fileName}.xlsx`);
    }

    async function exportDisplayed<T>(gridId: string, api: GridApi<T>) {
        const columns = getColumns(api);
        const rows = getDisplayedRows(api);
        if (!rows.length) return;
        await requestExcelDownload({ gridId, columns, rows });
    }

    async function exportDisplayedSelected<T>(gridId: string, api: GridApi<T>) {
        const columns = getColumns(api);
        const rows = getDisplayedSelectedRows(api);
        if (!rows.length) return;
        await requestExcelDownload({
            gridId: `${gridId}_selected`,
            columns,
            rows,
            fileNameBase: `${gridId}_선택`,
            sheetName: `${gridId}_선택`,
        });
    }

    return {
        exportDisplayed,
        exportDisplayedSelected,
    };
}
