<template>
    <div class="page-demo">
        <div class="page-demo-layout">
            <main class="page-demo-main">
                <header class="page-demo__header">
                    <h1 class="page-demo__title">{{ title }}</h1>
                    <p class="page-demo__desc">{{ description }}</p>
                </header>

                <!-- BASIC TYPES -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Basic Types
                    </h2>

                    <p class="page-demo__desc">
                        AppTableField가 지원하는 셀 타입들을 한 번에 확인하는 데모입니다.
                        각 행의 <code>th</code>에는 <code>cell.type</code>이, <code>td</code>에는 해당 타입의 컴포넌트가 렌더링됩니다.
                    </p>

                    <AppTable :model-value="basicForm" :rows="basicRows" title="Basic" default-label-width="160px"
                        @update:model-value="updateBasicForm" @field-action="handleFieldAction" />
                </section>

                <!-- BUTTON TYPES -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Button Types
                    </h2>

                    <p class="page-demo-card__desc">
                        button / input_button / input_button-text / input-text / text-button 타입 예시입니다.
                    </p>

                    <AppTable :model-value="buttonForm" :rows="buttonRows" title="Button Variants"
                        default-label-width="160px" @update:model-value="updateButtonForm"
                        @field-action="handleFieldAction" />
                </section>

                <!-- CHOICE TYPES -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Choice Types
                    </h2>

                    <p class="page-demo-card__desc">
                        radio / checkbox 타입 예시입니다.
                    </p>

                    <AppTable :model-value="choiceForm" :rows="choiceRows" title="Choice" default-label-width="160px"
                        @update:model-value="updateChoiceForm" @field-action="handleFieldAction" />
                </section>

                <!-- DATE TYPES -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Date Types
                    </h2>

                    <p class="page-demo-card__desc">
                        date / range_date 타입 예시입니다.
                    </p>

                    <AppTable :model-value="dateForm" :rows="dateRows" title="Date" default-label-width="160px"
                        @update:model-value="updateDateForm" @field-action="handleFieldAction" />
                </section>

                <!-- CONTACT TYPES -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Contact Types
                    </h2>

                    <p class="page-demo-card__desc">
                        phone / email 타입 예시입니다.
                    </p>

                    <AppTable :model-value="contactForm" :rows="contactRows" title="Contact" default-label-width="160px"
                        @update:model-value="updateContactForm" @field-action="handleFieldAction" />
                </section>

                <!-- STATE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Readonly / Disabled
                    </h2>

                    <p class="page-demo-card__desc">
                        readonly / disabled 상태 확인용 예시입니다.
                    </p>

                    <div class="page-demo-stack">
                        <AppTable :model-value="stateForm" :rows="stateRows" title="Readonly"
                            default-label-width="160px" readonly @update:model-value="updateStateForm"
                            @field-action="handleFieldAction" />

                        <AppTable :model-value="disabledForm" :rows="disabledRows" title="Disabled"
                            default-label-width="160px" disabled @update:model-value="updateDisabledForm"
                            @field-action="handleFieldAction" />
                    </div>
                </section>
            </main>

            <aside class="page-demo-aside" aria-label="현재 값 패널">
                <div class="page-demo-aside__sticky">
                    <section class="page-demo-card">
                        <h2 class="page-demo-card__title">
                            Current Value
                        </h2>

                        <pre class="page-demo-output">{{ output }}</pre>
                    </section>
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { AppTableOption, AppTableRow } from '~/types/table'
const { title, description } = useDemoI18n('table')

const selectOptions: AppTableOption[] = [
    { label: '선택하세요', value: null },
    { label: '옵션 A', value: 'a' },
    { label: '옵션 B', value: 'b' },
    { label: '옵션 C', value: 'c' },
]

const radioOptions: AppTableOption[] = [
    { label: '합격', value: 'pass' },
    { label: '불합격', value: 'fail' },
]

const checkboxOptions: AppTableOption[] = [
    { label: '옵션 1', value: 'option1' },
    { label: '옵션 2', value: 'option2' },
    { label: '옵션 3', value: 'option3' },
]

const basicForm = ref<Record<string, unknown>>({
    textValue: '텍스트 값',
    inputValue: '',
    selectValue: null,
    textareaValue: '',
})

const buttonForm = ref<Record<string, unknown>>({
    buttonOnly: '',
    inputButtonValue: '',
    inputButtonTextValue: '',
    inputTextValue: '',
    textButtonValue: '텍스트 + 버튼',
})

const choiceForm = ref<Record<string, unknown>>({
    radioValue: 'pass',
    checkboxValue: ['option1'],
    toggleValue: true,
})

const dateForm = ref<Record<string, unknown>>({
    dateValue: '2026-04-27',
    range: {
        start: null,
        end: null,
    },
})

const contactForm = ref<Record<string, unknown>>({
    phone1: '',
    phone2: '',
    phone3: '',
    emailId: '',
    emailDomain: '',
})

const stateForm = ref<Record<string, unknown>>({
    readonlyInput: '읽기 전용 값',
    readonlySelect: 'b',
    readonlyDate: '2026-04-27',
})

const disabledForm = ref<Record<string, unknown>>({
    disabledInput: '비활성 값',
    disabledRadio: 'pass',
    disabledCheckbox: ['option1'],
    disabledDate: '2026-04-27',
})

const basicRows: AppTableRow[] = [
    {
        cells: [
            {
                label: 'text',
                key: 'textValue',
                type: 'text',
            },
        ],
    },
    {
        cells: [
            {
                label: 'input',
                key: 'inputValue',
                type: 'input',
                placeholder: '입력하세요.',
            },
        ],
    },
    {
        cells: [
            {
                label: 'select',
                key: 'selectValue',
                type: 'select',
                placeholder: '선택하세요.',
                options: selectOptions,
            },
        ],
    },
    {
        cells: [
            {
                label: 'textarea',
                key: 'textareaValue',
                type: 'textarea',
                placeholder: '입력하세요.',
                rows: 4,
            },
        ],
    },
]

const buttonRows: AppTableRow[] = [
    {
        cells: [
            {
                label: 'button',
                key: 'buttonOnly',
                type: 'button',
                buttonText: '버튼',
            },
        ],
    },
    {
        cells: [
            {
                label: 'input_button',
                key: 'inputButtonValue',
                type: 'input_button',
                placeholder: '검색어를 입력하세요.',
                buttonText: '검색',
            },
        ],
    },
    {
        cells: [
            {
                label: 'input_button-text',
                key: 'inputButtonTextValue',
                type: 'input_button-text',
                placeholder: '입력하세요.',
                buttonText: '확인',
                text: '보조 텍스트',
            },
        ],
    },
    {
        cells: [
            {
                label: 'input-text',
                key: 'inputTextValue',
                type: 'input-text',
                placeholder: '입력하세요.',
                text: 'suffix',
            },
        ],
    },
    {
        cells: [
            {
                label: 'text-button',
                key: 'textButtonValue',
                type: 'text-button',
                text: '텍스트 + 버튼',
                buttonText: '열기',
            },
        ],
    },
]

const choiceRows: AppTableRow[] = [
    {
        cells: [
            {
                label: 'radio',
                key: 'radioValue',
                type: 'radio',
                options: radioOptions,
            },
        ],
    },
    {
        cells: [
            {
                label: 'checkbox',
                key: 'checkboxValue',
                type: 'checkbox',
                options: checkboxOptions,
            },
        ],
    },
    {
        cells: [
            {
                label: 'toggle',
                key: 'toggleValue',
                type: 'toggle',
                text: '활성화',
            },
        ],
    },
]

const dateRows: AppTableRow[] = [
    {
        cells: [
            {
                label: 'date',
                key: 'dateValue',
                type: 'date',
            },
        ],
    },
    {
        cells: [
            {
                label: 'range_date',
                key: 'range',
                type: 'range_date',
            },
        ],
    },
]

const contactRows: AppTableRow[] = [
    {
        cells: [
            {
                label: 'phone',
                type: 'phone',
                keys: ['phone1', 'phone2', 'phone3'],
                placeholders: ['010', '0000', '0000'],
            },
        ],
    },
    {
        cells: [
            {
                label: 'email',
                type: 'email',
                keys: ['emailId', 'emailDomain'],
                placeholders: ['id', 'domain.com'],
            },
        ],
    },
]

const stateRows: AppTableRow[] = [
    {
        cells: [
            {
                label: 'input',
                key: 'readonlyInput',
                type: 'input',
                readonly: true,
            },
        ],
    },
    {
        cells: [
            {
                label: 'select',
                key: 'readonlySelect',
                type: 'select',
                options: selectOptions,
                readonly: true,
            },
        ],
    },
    {
        cells: [
            {
                label: 'date',
                key: 'readonlyDate',
                type: 'date',
                readonly: true,
            },
        ],
    },
]

const disabledRows: AppTableRow[] = [
    {
        cells: [
            {
                label: 'input',
                key: 'disabledInput',
                type: 'input',
            },
        ],
    },
    {
        cells: [
            {
                label: 'radio',
                key: 'disabledRadio',
                type: 'radio',
                options: radioOptions,
            },
        ],
    },
    {
        cells: [
            {
                label: 'checkbox',
                key: 'disabledCheckbox',
                type: 'checkbox',
                options: checkboxOptions,
            },
        ],
    },
    {
        cells: [
            {
                label: 'date',
                key: 'disabledDate',
                type: 'date',
            },
        ],
    },
]

function updateBasicForm(next: Record<string, unknown>) {
    basicForm.value = next
}

function updateButtonForm(next: Record<string, unknown>) {
    buttonForm.value = next
}

function updateChoiceForm(next: Record<string, unknown>) {
    choiceForm.value = next
}

function updateDateForm(next: Record<string, unknown>) {
    dateForm.value = next
}

function updateContactForm(next: Record<string, unknown>) {
    contactForm.value = next
}

function updateStateForm(next: Record<string, unknown>) {
    stateForm.value = next
}

function updateDisabledForm(next: Record<string, unknown>) {
    disabledForm.value = next
}

function handleFieldAction(cell: unknown) {
    console.log('field action:', cell)
}

const output = computed(() =>
    JSON.stringify(
        {
            basicForm: basicForm.value,
            buttonForm: buttonForm.value,
            choiceForm: choiceForm.value,
            dateForm: dateForm.value,
            contactForm: contactForm.value,
            stateForm: stateForm.value,
            disabledForm: disabledForm.value,
        },
        null,
        2,
    ),
)
</script>