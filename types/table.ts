export type AppTableOption = {
    label: string;
    value: string | number | boolean | null;
    disabled?: boolean;
};

export type AppTableFieldType =
    | 'text'
    | 'input'
    | 'toggle'
    | 'button'
    | 'input_button'
    | 'input_button-text'
    | 'text-button'
    | 'input-text'
    | 'radio'
    | 'checkbox'
    | 'date'
    | 'range_date'
    | 'phone'
    | 'email'
    | 'select'
    | 'textarea';

export type AppTableCell = {
    label?: string;
    key?: string;
    keys?: string[];
    startKey?: string;
    endKey?: string;
    type?: AppTableFieldType;
    options?: AppTableOption[];
    placeholder?: string;
    placeholders?: string[];
    text?: string;
    buttonText?: string;
    helperText?: string;
    rows?: number;
    colspan?: number;
    rowspan?: number;
    labelColspan?: number;
    full?: boolean;
    readonly?: boolean;
    disabled?: boolean;
    visible?: boolean | ((model: Record<string, unknown>) => boolean);
    defaultValue?: unknown | ((model: Record<string, unknown>, cell: AppTableCell) => unknown);
    slot?: string;
    isRequired?: boolean;
    labelClass?: string;
    valueClass?: string;
};

export type AppTableRow = {
    id?: string | number;
    visible?: boolean | ((model: Record<string, unknown>) => boolean);
    cells: AppTableCell[];
};
