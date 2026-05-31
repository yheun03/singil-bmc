<template>
    <div class="page-demo">
        <div class="page-demo-layout">
            <main class="page-demo-main">
                <header class="page-demo__header">
                    <h1 class="page-demo__title">{{ title }}</h1>
                    <p class="page-demo__desc">
                        modal host + store 기반 모달 데모입니다.
                        개별 모달 컴포넌트를 직접 렌더링하지 않고,
                        handler에서 <code>modalOpen(...)</code>만 호출해 Alert / Confirm / Custom 모달을 엽니다.
                    </p>
                </header>

                <!-- BASIC -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Basic</h2>
                    <p class="page-demo-card__desc">
                        가장 기본적인 Alert / Confirm / Custom 모달 오픈 예시입니다.
                    </p>

                    <div class="page-demo-actions">
                        <AppButton variant="fill" @click="handleOpenAlert">
                            Alert 열기
                        </AppButton>

                        <AppButton variant="outline" @click="handleOpenConfirm">
                            Confirm 열기
                        </AppButton>

                        <AppButton variant="outline" @click="handleOpenCustom">
                            Custom 열기
                        </AppButton>
                    </div>
                </section>

                <!-- ALERT -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Alert Props</h2>
                    <p class="page-demo-card__desc">
                        title, message, confirmText, closeOnDim, closeOnEsc, closable 조합 예시입니다.
                    </p>

                    <div class="page-demo-actions">
                        <AppButton variant="fill" @click="handleOpenAlertBasic">
                            기본 Alert
                        </AppButton>

                        <AppButton variant="outline" @click="handleOpenAlertNoClose">
                            닫기 제한 Alert
                        </AppButton>

                        <AppButton variant="outline" @click="handleOpenAlertCustomText">
                            버튼 텍스트 변경
                        </AppButton>

                        <AppButton variant="outline" @click="handleOpenNestedAlert">
                            Alert 중첩 열기
                        </AppButton>
                    </div>
                </section>

                <!-- CONFIRM -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Confirm Props</h2>
                    <p class="page-demo-card__desc">
                        confirmText, cancelText, closeOnDim, closeOnEsc, closable 조합 예시입니다.
                    </p>

                    <div class="page-demo-actions">
                        <AppButton variant="fill" @click="handleOpenConfirmBasic">
                            기본 Confirm
                        </AppButton>

                        <AppButton variant="outline" @click="handleOpenConfirmNoDimClose">
                            배경 닫기 제한
                        </AppButton>

                        <AppButton variant="outline" @click="handleOpenConfirmNoEscClose">
                            ESC 닫기 제한
                        </AppButton>

                        <AppButton variant="outline" @click="handleOpenNestedConfirm">
                            Confirm 중첩 열기
                        </AppButton>
                    </div>
                </section>

                <!-- CUSTOM -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Custom Modal</h2>
                    <p class="page-demo-card__desc">
                        component와 componentProps를 전달해 원하는 내용을 렌더링하는 방식입니다.
                        실무에서는 별도 컴포넌트 전달 방식이 유지보수에 유리합니다.
                    </p>

                    <div class="page-demo-actions">
                        <AppButton variant="fill" @click="handleOpenCustom">
                            Custom 열기
                        </AppButton>

                        <AppButton variant="outline" @click="handleOpenNestedCustom">
                            Custom 중첩 열기
                        </AppButton>
                    </div>
                </section>

                <!-- VIEWER -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Viewer Modal</h2>
                    <p class="page-demo-card__desc">
                        이미지/PDF 미리보기처럼 `custom` 모달을 재사용하는 예시입니다.
                    </p>

                    <div class="page-demo-actions">
                        <AppButton variant="fill" @click="handleOpenImageViewer">
                            이미지 뷰어 열기
                        </AppButton>

                        <AppButton variant="outline" @click="handleOpenPdfViewer">
                            PDF 뷰어 열기
                        </AppButton>
                    </div>
                </section>

                <!-- CONTROL -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Store Control</h2>
                    <p class="page-demo-card__desc">
                        스토어 기준으로 최상단 모달 닫기, 전체 모달 닫기 같은 제어도 가능합니다.
                    </p>

                    <div class="page-demo-actions">
                        <AppButton variant="outline" @click="handleCloseTop">
                            최상단 모달 닫기
                        </AppButton>

                        <AppButton variant="text" @click="handleClearAll">
                            전체 모달 닫기
                        </AppButton>
                    </div>
                </section>
            </main>

            <aside class="page-demo-aside" aria-label="현재 값 패널">
                <div class="page-demo-aside__sticky">
                    <section class="page-demo-card">
                        <h2 class="page-demo-card__title">Current Value</h2>
                        <pre class="page-demo-output">{{ output }}</pre>
                    </section>
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useModalViewer } from '~/composables/useModalViewer'
import { useModalStore } from '~/stores/modal'
import ModalRendererExample from '~/pages/demos/modal/ModalRendererExample.vue'

const { title } = useDemoI18n('modal')
const modalStore = useModalStore()
const { openImageViewer, openPdfViewer } = useModalViewer()

const lastAction = ref('-')

function handleOpenAlert() {
    handleOpenAlertBasic()
}

function handleOpenAlertBasic() {
    modalStore.modalOpen({
        type: 'alert',
        message: '간단한 안내 메시지입니다.',
        onConfirm: () => {
            lastAction.value = 'alert:confirm'
        },
        onClose: (reason) => {
            lastAction.value = `alert:close:${reason ?? 'unknown'}`
        },
    })
}

function handleOpenAlertNoClose() {
    modalStore.modalOpen({
        type: 'alert',
        title: '닫기 제한 Alert',
        message: 'dim 클릭과 ESC로는 닫히지 않습니다.',
        closable: false,
        closeOnDim: false,
        closeOnEsc: false,
        onConfirm: () => {
            lastAction.value = 'alert:no-close:confirm'
        },
        onClose: (reason) => {
            lastAction.value = `alert:no-close:${reason ?? 'unknown'}`
        },
    })
}

function handleOpenAlertCustomText() {
    modalStore.modalOpen({
        type: 'alert',
        title: '버튼 텍스트 변경',
        message: 'confirmText 속성으로 버튼 문구를 변경할 수 있습니다.',
        confirmText: '이해했습니다',
        onConfirm: () => {
            lastAction.value = 'alert:custom-text:confirm'
        },
        onClose: (reason) => {
            lastAction.value = `alert:custom-text:${reason ?? 'unknown'}`
        },
    })
}

function handleOpenNestedAlert() {
    modalStore.modalOpen({
        type: 'alert',
        title: '1차 Alert',
        message: '확인을 누르면 이 Alert는 유지한 채 상단에 Alert를 하나 더 엽니다.',
        confirmText: '상단 Alert 열기',
        keepOnConfirm: true,
        onConfirm: () => {
            lastAction.value = 'alert:nested:confirm'

            modalStore.modalOpen({
                type: 'alert',
                title: '2차 Alert',
                message: '이 Alert가 최상단입니다.',
                onConfirm: () => {
                    lastAction.value = 'alert:nested:top-confirm'
                },
                onClose: (reason) => {
                    lastAction.value = `alert:nested:top-close:${reason ?? 'unknown'}`
                },
            })
        },
        onClose: (reason) => {
            lastAction.value = `alert:nested:close:${reason ?? 'unknown'}`
        },
    })
}

function handleOpenConfirm() {
    handleOpenConfirmBasic()
}

function handleOpenConfirmBasic() {
    modalStore.modalOpen({
        type: 'confirm',
        message: '정말 진행할까요?',
        onConfirm: () => {
            lastAction.value = 'confirm:confirm'

            modalStore.modalOpen({
                type: 'alert',
                title: 'Confirm 결과',
                message: 'Confirm에서 확인을 눌렀습니다.',
            })
        },
        onCancel: () => {
            lastAction.value = 'confirm:cancel'
        },
        onClose: (reason) => {
            lastAction.value = `confirm:close:${reason ?? 'unknown'}`
        },
    })
}

function handleOpenConfirmNoDimClose() {
    modalStore.modalOpen({
        type: 'confirm',
        title: '배경 닫기 제한',
        message: '배경 클릭으로는 닫히지 않습니다.',
        closeOnDim: false,
        onConfirm: () => {
            lastAction.value = 'confirm:no-dim:confirm'
        },
        onCancel: () => {
            lastAction.value = 'confirm:no-dim:cancel'
        },
        onClose: (reason) => {
            lastAction.value = `confirm:no-dim:close:${reason ?? 'unknown'}`
        },
    })
}

function handleOpenConfirmNoEscClose() {
    modalStore.modalOpen({
        type: 'confirm',
        title: 'ESC 닫기 제한',
        message: 'ESC 키로는 닫히지 않습니다.',
        closeOnEsc: false,
        onConfirm: () => {
            lastAction.value = 'confirm:no-esc:confirm'
        },
        onCancel: () => {
            lastAction.value = 'confirm:no-esc:cancel'
        },
        onClose: (reason) => {
            lastAction.value = `confirm:no-esc:close:${reason ?? 'unknown'}`
        },
    })
}

function handleOpenNestedConfirm() {
    modalStore.modalOpen({
        type: 'confirm',
        title: '중첩 테스트',
        message: '확인을 누르면 현재 Confirm은 유지한 채 상단에 Alert를 엽니다.',
        confirmText: '상단 Alert 열기',
        keepOnConfirm: true,
        onConfirm: () => {
            lastAction.value = 'confirm:nested:confirm'

            modalStore.modalOpen({
                type: 'alert',
                title: '최상단 Alert',
                message: '이 모달이 최상단입니다.',
                onConfirm: () => {
                    lastAction.value = 'confirm:nested:alert-confirm'
                },
                onClose: (reason) => {
                    lastAction.value = `confirm:nested:alert-close:${reason ?? 'unknown'}`
                },
            })
        },
        onCancel: () => {
            lastAction.value = 'confirm:nested:cancel'
        },
        onClose: (reason) => {
            lastAction.value = `confirm:nested:close:${reason ?? 'unknown'}`
        },
    })
}

function handleOpenCustom() {
    modalStore.modalOpen({
        type: 'custom',
        title: '커스텀 모달',
        width: '640px',
        component: ModalRendererExample,
        componentProps: {
            lastAction: lastAction.value,
            onAction: () => {
                lastAction.value = 'custom:action'
                modalStore.modalCloseTop('confirm')
            },
            onNestedAlert: () => {
                modalStore.modalOpen({
                    type: 'alert',
                    title: 'Custom 내부 Alert',
                    message: 'Custom 모달 위에 Alert가 열렸습니다.',
                })
            },
        },
        onClose: (reason) => {
            lastAction.value = `custom:close:${reason ?? 'unknown'}`
        },
    })
}

function handleOpenNestedCustom() {
    modalStore.modalOpen({
        type: 'custom',
        title: '1차 Custom',
        keepOnConfirm: true,
        component: ModalRendererExample,
        componentProps: {
            lastAction: lastAction.value,
            onAction: () => {
                lastAction.value = 'custom:nested:action'
            },
            onNestedAlert: () => {
                modalStore.modalOpen({
                    type: 'custom',
                    title: '2차 Custom',
                    width: '520px',
                    component: ModalRendererExample,
                    componentProps: {
                        lastAction: 'nested custom open',
                        onAction: () => {
                            lastAction.value = 'custom:nested:second-action'
                        },
                    },
                })
            },
        },
        onClose: (reason) => {
            lastAction.value = `custom:nested:close:${reason ?? 'unknown'}`
        },
    })
}

function handleOpenImageViewer() {
    openImageViewer({
        name: '샘플 이미지',
        url: 'https://picsum.photos/1200/800?random=31',
        alt: 'modal viewer sample image',
    })
    lastAction.value = 'viewer:image:open'
}

function handleOpenPdfViewer() {
    openPdfViewer({
        name: '샘플 PDF',
        path: '/files/sample.pdf',
    })
    lastAction.value = 'viewer:pdf:open'
}

function handleCloseTop() {
    modalStore.modalCloseTop('close')
}

function handleClearAll() {
    modalStore.clearAllModals()
    lastAction.value = 'modal:clear-all'
}

const output = computed(() =>
    JSON.stringify(
        {
            modalCount: modalStore.modals.length,
            topModalId: modalStore.topModalId,
            modalIds: modalStore.modals.map((modal) => ({
                id: modal.id,
                type: modal.type,
                title: modal.title ?? '',
            })),
            lastAction: lastAction.value,
        },
        null,
        2,
    ),
)
</script>