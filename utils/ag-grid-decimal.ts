import type {
    ColDef,
    ColDefField,
    ColGroupDef,
    RowClassParams,
    ValueFormatterParams,
} from 'ag-grid-community';

export function parseDecimalStatValue(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    const raw = String(value).trim();
    if (!raw || raw === '-' || raw === '—') {
        return null;
    }

    const normalized = raw.startsWith('.') ? `0${raw}` : raw;
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
}

export function compareDecimalStatValues(a: unknown, b: unknown): number {
    const numA = parseDecimalStatValue(a);
    const numB = parseDecimalStatValue(b);

    if (numA === null && numB === null) {
        return 0;
    }
    if (numA === null) {
        return 1;
    }
    if (numB === null) {
        return -1;
    }

    return numA - numB;
}

/** 숫자로 해석 가능하면 숫자 정렬, 아니면 문자열 정렬 */
export function smartGridComparator(valueA: unknown, valueB: unknown): number {
    const numA = parseDecimalStatValue(valueA);
    const numB = parseDecimalStatValue(valueB);

    if (numA !== null || numB !== null) {
        return compareDecimalStatValues(valueA, valueB);
    }

    if (valueA == null && valueB == null) {
        return 0;
    }
    if (valueA == null) {
        return 1;
    }
    if (valueB == null) {
        return -1;
    }

    return String(valueA).localeCompare(String(valueB), 'ko');
}

/** @deprecated smartGridComparator 사용 */
export const decimalStatComparator = smartGridComparator;

function fieldName<T>(col: ColDef<T>): string | undefined {
    const field = col.field ?? col.colId;
    return typeof field === 'string' ? field : undefined;
}

function sampleFieldValues(rows: unknown[] | null | undefined, field: string): unknown[] {
    if (!rows?.length) {
        return [];
    }

    return rows
        .map((row) => (row as Record<string, unknown> | undefined)?.[field])
        .filter((value) => value !== null && value !== undefined && value !== '');
}

/** 샘플 데이터 기준: 비어 있지 않은 값이 모두 숫자로 파싱되면 숫자 컬럼 */
function isNumericColumnBySample(field: string, rows: unknown[] | null | undefined): boolean {
    const values = sampleFieldValues(rows, field);
    if (!values.length) {
        return false;
    }

    return values.every((value) => parseDecimalStatValue(value) !== null);
}

function shouldEnhanceNumericColumn<T>(col: ColDef<T>, rows: unknown[] | null | undefined): boolean {
    if (col.valueGetter || col.cellDataType === 'text') {
        return false;
    }

    const field = fieldName(col);
    if (!field) {
        return false;
    }

    return isNumericColumnBySample(field, rows);
}

function enhanceColumnDef<T>(col: ColDef<T>, rows: unknown[] | null | undefined): ColDef<T> {
    if (!shouldEnhanceNumericColumn(col, rows)) {
        return col;
    }

    const field = fieldName(col) as ColDefField<T>;

    const readRaw = (params: { data?: unknown }) => {
        const data = params.data as Record<string, unknown> | undefined;
        return data?.[field as string];
    };

    const readDecimal = (params: { data?: unknown }) => parseDecimalStatValue(readRaw(params));

    const formatRawValue =
        col.valueFormatter ??
        ((params: ValueFormatterParams) => {
            const raw = readRaw(params);
            return raw == null || raw === '' ? '' : String(raw);
        });

    return {
        ...col,
        cellDataType: col.cellDataType ?? false,
        filter: col.filter ?? 'agNumberColumnFilter',
        comparator: col.comparator ?? smartGridComparator,
        filterValueGetter: col.filterValueGetter ?? readDecimal,
        valueGetter: col.valueGetter ?? readDecimal,
        valueFormatter: formatRawValue,
    };
}

function isColumnGroup<T>(col: ColDef<T> | ColGroupDef<T>): col is ColGroupDef<T> {
    return Array.isArray((col as ColGroupDef<T>).children);
}

export function enhanceGridColumnDefs<T = unknown>(
    columns: (ColDef<T> | ColGroupDef<T>)[] | null | undefined,
    rowData?: unknown[] | null,
): ColDef<T>[] {
    if (!columns?.length) {
        return [];
    }

    return columns.map((col) => {
        if (isColumnGroup(col)) {
            return {
                ...col,
                children: enhanceGridColumnDefs(col.children, rowData),
            };
        }

        return enhanceColumnDef(col, rowData);
    }) as ColDef<T>[];
}

export function enhanceGridDefaultColDef<T = unknown>(defaultColDef: ColDef<T> | undefined): ColDef<T> {
    return {
        ...defaultColDef,
        comparator: defaultColDef?.comparator ?? smartGridComparator,
    };
}

export function getGridRowStripeClass(params: RowClassParams): string {
    const index = params.node.rowIndex ?? 0;
    return index % 2 === 0 ? 'ag-row--stripe-even' : 'ag-row--stripe-odd';
}

export function combineGridRowClass(
    stripeClass: (params: RowClassParams) => string,
    userClass?: (params: RowClassParams) => string | string[] | undefined,
): (params: RowClassParams) => string {
    return (params) => {
        const classes = [stripeClass(params)];
        if (!userClass) {
            return classes.join(' ');
        }

        const extra = userClass(params);
        if (Array.isArray(extra)) {
            classes.push(...extra);
        } else if (extra) {
            classes.push(extra);
        }

        return classes.filter(Boolean).join(' ');
    };
}
