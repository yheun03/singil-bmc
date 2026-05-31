<template>
    <div class="page-demo">
        <div class="page-demo-layout">
            <main class="page-demo-main">

                <!-- HEADER -->
                <header class="page-demo__header">
                    <h1 class="page-demo__title">{{ title }}</h1>

                    <p class="page-demo__desc">{{ description }}</p>
                </header>

                <!-- BASIC -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Basic
                    </h2>

                    <p class="page-demo-card__desc">
                        기본 textarea 입력 예시입니다.
                    </p>

                    <AppTextarea v-model="basicValue" placeholder="내용을 입력하세요." />
                </section>

                <!-- WITH FORM FIELD -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        With FormField
                    </h2>

                    <p class="page-demo-card__desc">
                        AppFormField와 함께 label, hint, error를 연결합니다.
                    </p>

                    <AppFormField label="문의 내용" required hint="최대 200자까지 입력할 수 있습니다." :error="contentError">
                        <template #default="{ id, invalid, describedby }">
                            <AppTextarea :id="id" v-model="content" placeholder="문의 내용을 입력하세요." :max-length="200"
                                show-count clearable :invalid="invalid" :aria-describedby="describedby" />
                        </template>
                    </AppFormField>
                </section>

                <!-- SIZE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Size
                    </h2>

                    <p class="page-demo-card__desc">
                        sm / md / lg 크기를 비교합니다.
                    </p>

                    <div class="page-demo-stack">
                        <div class="page-demo-stack">
                            <div class="page-demo-hint">size = "sm"</div>

                            <AppTextarea v-model="smallValue" size="sm" placeholder="small textarea" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">size = "md"</div>

                            <AppTextarea v-model="mediumValue" size="md" placeholder="medium textarea" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">size = "lg"</div>

                            <AppTextarea v-model="largeValue" size="lg" placeholder="large textarea" />
                        </div>
                    </div>
                </section>

                <!-- RESIZE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Resize
                    </h2>

                    <p class="page-demo-card__desc">
                        resize 옵션별 textarea 크기 조절 방식을 확인합니다.
                    </p>

                    <div class="page-demo-stack">
                        <div class="page-demo-stack">
                            <div class="page-demo-hint">resize = "none"</div>

                            <AppTextarea v-model="resizeNoneValue" resize="none" placeholder="resize none" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">resize = "vertical"</div>

                            <AppTextarea v-model="resizeVerticalValue" resize="vertical"
                                placeholder="resize vertical" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">resize = "horizontal"</div>

                            <AppTextarea v-model="resizeHorizontalValue" resize="horizontal"
                                placeholder="resize horizontal" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">resize = "both"</div>

                            <AppTextarea v-model="resizeBothValue" resize="both" placeholder="resize both" />
                        </div>
                    </div>
                </section>

                <!-- STATES -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        States
                    </h2>

                    <p class="page-demo-card__desc">
                        disabled, readonly, invalid 상태를 확인합니다.
                    </p>

                    <div class="page-demo-stack">
                        <div class="page-demo-stack">
                            <div class="page-demo-hint">disabled</div>

                            <AppTextarea v-model="disabledValue" disabled placeholder="disabled textarea" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">readonly</div>

                            <AppTextarea v-model="readonlyValue" readonly placeholder="readonly textarea" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">invalid</div>

                            <AppTextarea v-model="invalidValue" invalid placeholder="invalid textarea" />
                        </div>
                    </div>
                </section>

                <!-- COUNT / CLEAR -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Count / Clear
                    </h2>

                    <p class="page-demo-card__desc">
                        글자 수 표시와 clearable 옵션을 확인합니다.
                    </p>

                    <AppTextarea v-model="countValue" placeholder="최대 100자까지 입력하세요." :max-length="100" show-count
                        clearable />
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
const { title, description } = useDemoI18n('textarea')

const basicValue = ref('')
const content = ref('')
const smallValue = ref('')
const mediumValue = ref('')
const largeValue = ref('')
const resizeNoneValue = ref('resize none')
const resizeVerticalValue = ref('resize vertical')
const resizeHorizontalValue = ref('resize horizontal')
const resizeBothValue = ref('resize both')
const disabledValue = ref('disabled value')
const readonlyValue = ref('readonly value')
const invalidValue = ref('invalid value')
const countValue = ref('')

const contentError = computed(() => {
    if (!content.value) return ''

    return content.value.length < 10 ? '문의 내용은 10자 이상 입력해주세요.' : ''
})

const output = computed(() =>
    JSON.stringify(
        {
            basicValue: basicValue.value,
            content: content.value,
            contentError: contentError.value,
            smallValue: smallValue.value,
            mediumValue: mediumValue.value,
            largeValue: largeValue.value,
            resizeNoneValue: resizeNoneValue.value,
            resizeVerticalValue: resizeVerticalValue.value,
            resizeHorizontalValue: resizeHorizontalValue.value,
            resizeBothValue: resizeBothValue.value,
            disabledValue: disabledValue.value,
            readonlyValue: readonlyValue.value,
            invalidValue: invalidValue.value,
            countValue: countValue.value,
            propsSummary: {
                modelValue: true,
                placeholder: true,
                disabled: true,
                readonly: true,
                rows: true,
                maxLength: true,
                showCount: true,
                clearable: true,
                invalid: true,
                size: ['sm', 'md', 'lg'],
                resize: ['none', 'vertical', 'horizontal', 'both'],
            },
        },
        null,
        2,
    ),
)
</script>