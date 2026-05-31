import type { ColDef, ColDefField, RowClassParams, ValueFormatterParams } from 'ag-grid-community';

/** 타율·OPS·ERA 등 문자열로 저장된 소수 통계 필드 */
export const DECIMAL_STAT_FIELDS = new Set([
    'avg',
    'obp',
    'slg',
    'ops',
    'ip',
    'era',
    'whip',
    'teamAvg',
]);

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

export function decimalStatComparator(valueA: unknown, valueB: unknown): number {
    return compareDecimalStatValues(valueA, valueB);
}

function fieldName<T>(col: ColDef<T>): string | undefined {
    const field = col.field ?? col.colId;
    return typeof field === 'string' ? field : undefined;
}

function isDecimalStatColumn<T>(col: ColDef<T>): boolean {
    const name = fieldName(col);
    return Boolean(name && DECIMAL_STAT_FIELDS.has(name));
}

export function enhanceGridColumnDefs<T = unknown>(columns: ColDef<T>[] | undefined): ColDef<T>[] {
    if (!columns?.length) {
        return [];
    }

    return columns.map((col) => {
        if (!isDecimalStatColumn(col)) {
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
            // 자동 text 추론 시 문자열 정렬이 우선되어 숫자 comparator가 무시될 수 있음
            cellDataType: col.cellDataType ?? false,
            filter: col.filter ?? 'agNumberColumnFilter',
            comparator: col.comparator ?? decimalStatComparator,
            filterValueGetter: col.filterValueGetter ?? readDecimal,
            valueGetter: col.valueGetter ?? readDecimal,
            valueFormatter: formatRawValue,
        };
    });
}

export function enhanceGridDefaultColDef<T = unknown>(defaultColDef: ColDef<T> | undefined): ColDef<T> {
    return {
        ...defaultColDef,
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
