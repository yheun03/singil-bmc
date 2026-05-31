export type { DateRangeValue } from '~/components/AppDatePicker.vue';

/**
 * 그리드 검색 필드 UI 타입.
 *
 * - `text` → `input`과 동일(하위 호환).
 * - `date` → 단일 날짜(`calendar`와 동일 의미, AppTable `date` 정렬).
 * - `range_date` → 기간 날짜(`range_calendar`와 동일 의미, AppTable `range_date` 정렬).
 * - `switch` → `toggle`과 동일(스위치 UI 의미).
 * - `time` / `datetime`: 시간·일시 검색(컴포넌트 연동 시 확장).
 */
export type AppGridSearchFieldType =
    | 'input'
    | 'textarea'
    | 'number'
    | 'decimal'
    | 'number_range'
    | 'select'
    | 'multiselect'
    | 'select_input'
    | 'radio'
    | 'checkbox'
    | 'toggle'
    | 'switch'
    | 'calendar'
    | 'date'
    | 'time'
    | 'datetime'
    | 'range_calendar'
    | 'range_date'
    | 'range_calendar_minmax'
    | 'email'
    | 'phone'
    | 'input_button'
    | 'input_text'
    | 'input_button_text'
    | 'text_button'
    | 'text';

export type AppGridSearchFieldOption = {
    label: string;
    value: string | number;
    disabled?: boolean;
};

/** `select_input`: 검색할 컬럼(field) 선택 + 자유 입력 */
export type AppGridSearchSelectInputConfig = {
    /** model 키 — 선택된 그리드 컬럼 field 문자열 */
    columnKey: string;
    /** model 키 — 검색어 */
    textKey: string;
    options: AppGridSearchFieldOption[];
};

/** 숫자 컬럼 구간 검색(min/max 모델 키 분리) — `type: 'number_range'` */
export type AppGridSearchNumberRangeConfig = {
    minKey: string;
    maxKey: string;
};

/**
 * `email` / `phone` 등 분할 입력(AppTable `keys`·`placeholders`와 동일 패턴).
 * 필터 적용 시 값을 합치거나 컬럼별로 나누는 로직은 그리드 쪽에서 처리.
 */
export type AppGridSearchSplitInputConfig = {
    keys: string[];
    placeholders?: string[];
};

/** `input_button*` / `text_button`용 */
export type AppGridSearchFieldAction = 'search' | 'clear' | string;

export type AppGridSearchField = {
    /** v-for용 고유 키 (`select_input` 등에서 `field`와 별도일 때) */
    id?: string;
    /**
     * ag-grid 컬럼 field (필터 적용 대상).
     * `select_input`은 `selectInput.columnKey` 값이 실제 컬럼이 되므로 여기엔 임의 식별 문자열을 둬도 됨.
     */
    field: string;
    /** model `field`와 다른 컬럼에 필터를 걸 때 (예: checkbox 값 키와 대상 컬럼 분리) */
    filterField?: string;
    /** dt에 표시되는 라벨 (컴포넌트 내장 label 미사용) */
    label: string;
    type?: AppGridSearchFieldType;
    placeholder?: string;
    /** `select_input` 전용: 텍스트 입력 placeholder */
    placeholderInput?: string;
    /** `select` / `select_input` 셀렉트 placeholder */
    placeholderSelect?: string;
    options?: AppGridSearchFieldOption[];
    selectInput?: AppGridSearchSelectInputConfig;
    /** `range_calendar_minmax` / 단일 `calendar`·`date` 제한 */
    min?: string;
    max?: string;
    /**
     * `checkbox`에서 컬럼이 `agSetColumnFilter`일 때 true.
     * `select`에서 단일 값을 set 필터로 적용할 때도 true(대상 컬럼이 set 필터일 때).
     * `multiselect`에서 다중 값을 set 필터로 적용할 때 true.
     * false면 텍스트 `equals` 필터.
     */
    setFilter?: boolean;
    /** `select_input`으로 검색할 때 숫자 필터를 쓸 컬럼 field 목록 */
    numberFilterFields?: string[];
    /** `textarea` 행 수 */
    rows?: number;
    /** `input` / `number` / `decimal` 등 HTML input type 힌트 */
    inputType?: 'text' | 'search' | 'tel' | 'email' | 'url' | 'number' | 'password';
    /** `number`·`decimal`·`number_range`용 step */
    step?: number | string;
    /** `number`·`decimal`·`number_range`용 하한(입력 UI) */
    inputMin?: number | string;
    /** `number`·`decimal`·`number_range`용 상한(입력 UI) */
    inputMax?: number | string;
    /** `type: 'number_range'`일 때 min/max 모델 키 */
    numberRange?: AppGridSearchNumberRangeConfig;
    /** `type: 'email'` | `phone` 분할 필드 */
    splitInput?: AppGridSearchSplitInputConfig;
    /** `input_button*` / `text_button` 버튼 문구 */
    buttonText?: string;
    /** `input_text` / `input_button_text` 등 보조 텍스트 */
    suffixText?: string;
    /** `input_button*` / `text_button` 클릭 시 emit 식별자(상위에서 `@field-action` 등으로 확장 시) */
    action?: AppGridSearchFieldAction;
    /** 검색어 입력 디바운스(ms) — 자동 검색 연동 시 */
    debounceMs?: number;
    /** 필드 단위 비활성 */
    disabled?: boolean;
    /** 필드 단위 읽기 전용 */
    readonly?: boolean;
};
