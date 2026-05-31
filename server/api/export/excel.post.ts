/**
 * 그리드 현재 표시 데이터(필터/정렬 반영)를 엑셀 파일로 다운로드
 * POST body: { gridId: string, columns: { field: string, headerName: string }[], rows: Record<string, unknown>[] }
 */
import * as XLSX from 'xlsx';

interface ExportExcelBody {
    gridId: string;
    columns: { field: string; headerName: string }[];
    rows: Record<string, unknown>[];
    fileName?: string;
    sheetName?: string;
    origin?: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<ExportExcelBody>(event);
    if (!body?.gridId || !Array.isArray(body.columns) || !Array.isArray(body.rows)) {
        throw createError({
            statusCode: 400,
            message: 'gridId, columns, rows 가 필요합니다.',
        });
    }

    const { gridId, columns, rows } = body;
    const headerRow = columns.map((c) => c.headerName || c.field);
    const dataRows = rows.map((row) =>
        columns.map((col) => {
            const v = row[col.field];
            if (v === null || v === undefined) return '';
            return v;
        }),
    );

    const aoa = [headerRow, ...dataRows];
    const origin = (body.origin || 'A1').toUpperCase();
    if (!/^[A-Z]+[1-9]\d*$/.test(origin)) {
        throw createError({ statusCode: 400, message: 'origin 형식이 올바르지 않습니다. 예: A1, B3' });
    }

    const ws = XLSX.utils.aoa_to_sheet([], {});
    XLSX.utils.sheet_add_aoa(ws, aoa, { origin });
    const wb = XLSX.utils.book_new();
    const sheetName = (body.sheetName || gridId || 'export').slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as unknown;

    const baseName = (body.fileName || gridId || 'export').replace(/[\\/:*?"<>|]/g, '_');
    const filename = baseName.toLowerCase().endsWith('.xlsx') ? baseName : `${baseName}.xlsx`;
    const encoded = encodeURIComponent(filename);

    // Nitro/h3 환경에서 헤더 헬퍼(setResponseHeader)가 타입에 없을 수 있어
    // 서버 res 객체에 직접 세팅합니다.
    event.node.res.setHeader('Content-Disposition', `attachment; filename="export.xlsx"; filename*=UTF-8''${encoded}`);
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return buffer;
});
