import type {
    ColDef,
    ColDefField,
    ColGroupDef,
    IRowNode,
    RowClassParams,
    ValueFormatterParams,
} from 'ag-grid-community';

/** 정렬·필터를 문자열로 유지할 컬럼 */
const TEXT_COLUMN_FIELDS = new Set([
    'name',
    'group',
    'playerId',
    'id',
    'key',
    'title',
    'summary',
    'opponent',
    'gameId',
    'position',
    'teamName',
    'image',
    'label',
    'desc',
    'type',
    'status',
]);

/**
 * GameOne summary JSON에서 문자열로 저장되는 비율·이닝 통계.
 * (.659, 8.33, 21.0 등)
 */
const DECIMAL_STRING_FIELDS = new Set([
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

function readFieldValue(data: unknown, field: string) {
    return (data as Record<string, unknown> | undefined)?.[field];
}

/** AG Grid v33은 field 문자열로 정렬하는 경우가 있어 node.data에서 직접 읽는다 */
function createDecimalStatComparator<T>(field: string) {
    return (
        _valueA: unknown,
        _valueB: unknown,
        nodeA?: IRowNode<T>,
        nodeB?: IRowNode<T>,
    ) => compareDecimalStatValues(readFieldValue(nodeA?.data, field), readFieldValue(nodeB?.data, field));
}

function isDecimalStringColumn<T>(col: ColDef<T>): boolean {
    const field = fieldName(col);
    if (!field || col.valueGetter) {
        return false;
    }
    if (TEXT_COLUMN_FIELDS.has(field) || col.cellDataType === 'text') {
        return false;
    }

    return DECIMAL_STRING_FIELDS.has(field);
}

function enhanceDecimalColumnDef<T>(col: ColDef<T>): ColDef<T> {
    const field = fieldName(col) as ColDefField<T>;

    const readRaw = (params: { data?: unknown }) => readFieldValue(params.data, field as string);

    const readSortValue = (params: { data?: unknown }) => parseDecimalStatValue(readRaw(params));

    const formatRawValue =
        col.valueFormatter ??
        ((params: ValueFormatterParams) => {
            const raw = readRaw(params);
            return raw == null || raw === '' ? '' : String(raw);
        });

    return {
        ...col,
        cellDataType: 'number',
        filter: col.filter ?? 'agNumberColumnFilter',
        comparator: col.comparator ?? createDecimalStatComparator(field as string),
        filterValueGetter: col.filterValueGetter ?? readSortValue,
        valueGetter: col.valueGetter ?? readSortValue,
        valueFormatter: formatRawValue,
    };
}

function isColumnGroup<T>(col: ColDef<T> | ColGroupDef<T>): col is ColGroupDef<T> {
    return Array.isArray((col as ColGroupDef<T>).children);
}

export function enhanceGridColumnDefs<T = unknown>(
    columns: (ColDef<T> | ColGroupDef<T>)[] | null | undefined,
): ColDef<T>[] {
    if (!columns?.length) {
        return [];
    }

    return columns.map((col) => {
        if (isColumnGroup(col)) {
            return {
                ...col,
                children: enhanceGridColumnDefs(col.children),
            };
        }

        return isDecimalStringColumn(col) ? enhanceDecimalColumnDef(col) : col;
    }) as ColDef<T>[];
}

export function enhanceGridDefaultColDef<T = unknown>(defaultColDef: ColDef<T> | undefined): ColDef<T> {
    return {
        ...defaultColDef,
        cellDataType: defaultColDef?.cellDataType ?? false,
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
