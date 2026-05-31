<template>
    <div class="page-demo">
        <div class="page-demo-layout">
            <main class="page-demo-main">
                <header class="page-demo__header">
                    <h1 class="page-demo__title">{{ title }}</h1>
                    <p class="page-demo__desc">{{ description }}</p>
                </header> <!-- GRID 1 -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">사용자 목록</h2>
                    <AppGridToolbar target="grid1">
                        <AppGridSearch v-model="search1" :fields="searchFields1" />
                        <AppGridDownload />
                    </AppGridToolbar>
                    <ClientOnly>
                        <AppGrid grid-id="grid1" class="page-demo-grid" :row-data="rows1" :column-defs="columns1"
                            :default-col-def="defaultColDef" :get-row-height="getRowHeight" row-selection="multiple"
                            animate-rows :style="{ height: '320px', width: '100%' }" />
                    </ClientOnly>
                </section> <!-- GRID 2 -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">주문 목록</h2>
                    <AppGridToolbar target="grid2">
                        <AppGridSearch v-model="search2" :fields="searchFields2" />
                        <AppGridDownload />
                    </AppGridToolbar>
                    <ClientOnly>
                        <AppGrid grid-id="grid2" class="page-demo-grid" :row-data="rows2" :column-defs="columns2"
                            :default-col-def="defaultColDef" :get-row-height="getRowHeight" row-selection="multiple"
                            animate-rows :style="{ height: '320px', width: '100%' }" />
                    </ClientOnly>
                </section> <!-- GRID 3 -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">상품 조회 (단순 그리드)</h2>
                    <AppGridToolbar target="grid3">
                        <AppGridSearch v-model="search3" :fields="searchFields3" />
                        <AppGridDownload />
                    </AppGridToolbar>
                    <ClientOnly>
                        <AppGrid grid-id="grid3" class="page-demo-grid" :row-data="rows3" :column-defs="columns3"
                            :default-col-def="defaultColDef" :get-row-height="getRowHeight" animate-rows
                            :style="{ height: '320px', width: '100%' }" />
                    </ClientOnly>
                </section>
            </main>

            <aside class="page-demo-aside" aria-label="검색 상태 패널">
                <div class="page-demo-aside__sticky page-demo-stack">
                    <section class="page-demo-card">
                        <h2 class="page-demo-card__title">
                            검색 폼 값 (v-model)
                        </h2>
                        <p class="page-demo-card__desc">
                            각 그리드 <code>AppGridSearch</code>에 연결된 반응형 검색 객체입니다. 필드를 조작하면 실시간으로 갱신됩니다.
                        </p>
                        <pre class="page-demo-output">{{ searchStateOutput }}</pre>
                    </section>

                    <section class="page-demo-card">
                        <h2 class="page-demo-card__title">
                            검색 필드 정의 (<code>fields</code>)
                        </h2>
                        <p class="page-demo-card__desc">
                            <code>AppGridSearchField</code> 배열 — <code>type</code>, <code>label</code>,
                            <code>filterField</code>,
                            <code>selectInput</code>, <code>numberRange</code> 등 속성을 한눈에 확인할 수 있습니다.
                        </p>
                        <pre class="page-demo-output">{{ searchFieldsOutput }}</pre>
                    </section>
                </div>
            </aside>
        </div>
    </div>

    <LayoutBottomBar>
        <template #right>
            <AppButton>test</AppButton>
        </template>
    </LayoutBottomBar>

</template>



<script setup lang="ts">
import type { ColDef } from 'ag-grid-community'

import type { AppGridSearchField, DateRangeValue } from '~/types/grid-search'

import AppGridCellSelect from '~/components/AppGrid/Cell/Select.vue'
import AppGridCellInput from '~/components/AppGrid/Cell/Input.vue'
import AppGridCellChoice from '~/components/AppGrid/Cell/Choice.vue'
import AppGridCellImage from '~/components/AppGrid/Cell/Image.vue'
import AppGridCellFile from '~/components/AppGrid/Cell/File.vue'

const { title, description } = useDemoI18n('grid')


/* 행 높이 동적 처리 */

const getRowHeight = (params: any) => {
    if (Array.isArray(params.data?.attachments) && params.data.attachments.length) {
        return 260
    }

    if (params.data?.manualFile) {
        return 140
    }

    if (Array.isArray(params.data?.productGallery) && params.data.productGallery.length) {
        return 240
    }

    if (params.data?.productImage) {
        return 100
    }

    return 42
}


/* 검색 상태 */

const deptSearchOptions = [
    { label: '개발', value: '개발' },
    { label: '디자인', value: '디자인' },
    { label: '기획', value: '기획' },
    { label: '운영', value: '운영' }
]

const search1 = reactive({
    name: '',
    verifiedPick: null as string | null,
    qCol: 'name',
    qText: '',
    grade: '' as string,
    departmentSet: [] as string[],
    activeOnly: false,
    joinedAt: null as string | null
})

const searchFields1: AppGridSearchField[] = [
    { field: 'name', label: '이름', type: 'input', placeholder: '이름 검색' },
    {
        field: 'verifiedPick',
        filterField: 'verified',
        label: '인증 여부',
        type: 'select',
        placeholderSelect: '선택',
        options: [
            { label: 'Y (인증)', value: 'Y' },
            { label: 'N (미인증)', value: 'N' }
        ]
    },
    {
        id: 'search1-composite',
        field: '_composite',
        label: '통합 검색',
        type: 'select_input',
        selectInput: {
            columnKey: 'qCol',
            textKey: 'qText',
            options: [
                { label: '이름', value: 'name' },
                { label: '이메일', value: 'email' },
                { label: '부서', value: 'department' },
                { label: '점수', value: 'score' }
            ]
        },
        placeholderInput: '검색어 입력',
        numberFilterFields: ['score']
    },
    {
        field: 'grade',
        label: '등급',
        type: 'radio',
        options: [
            { label: 'A', value: 'A' },
            { label: 'B', value: 'B' },
            { label: 'C', value: 'C' }
        ]
    },
    {
        field: 'departmentSet',
        filterField: 'department',
        label: '부서(다중)',
        type: 'checkbox',
        setFilter: true,
        options: deptSearchOptions
    },
    {
        field: 'activeOnly',
        filterField: 'active',
        label: '재직(활성)만',
        type: 'toggle'
    },
    {
        field: 'joinedAt',
        label: '입사일',
        type: 'calendar',
        placeholder: '날짜 선택'
    }
]

const search2 = reactive({
    product: '',
    status: '' as string,
    date: null as DateRangeValue | null,
    shipDate: null as DateRangeValue | null
})

const searchFields2: AppGridSearchField[] = [
    { field: 'product', label: '상품', type: 'input', placeholder: '상품명' },
    {
        field: 'status',
        label: '상태',
        type: 'radio',
        options: [
            { label: 'READY', value: 'READY' },
            { label: 'DELIVERY', value: 'DELIVERY' },
            { label: 'DONE', value: 'DONE' }
        ]
    },
    {
        field: 'date',
        label: '주문일(기간)',
        type: 'range_calendar',
        placeholder: '주문일 범위'
    },
    {
        field: 'shipDate',
        label: '출고일(기간·min/max)',
        type: 'range_calendar_minmax',
        min: '2026-01-01',
        max: '2026-12-31',
        placeholder: '출고일 범위'
    }
]

const search3 = reactive({
    product: '',
    listedAt: null as string | null
})

const searchFields3: AppGridSearchField[] = [
    { field: 'product', label: '상품', type: 'input', placeholder: '상품 검색' },
    {
        field: 'listedAt',
        label: '등록일',
        type: 'calendar',
        placeholder: '등록일 선택'
    }
]

const searchStateOutput = computed(() =>
    JSON.stringify(
        {
            grid1: { ...search1 },
            grid2: { ...search2 },
            grid3: { ...search3 }
        },
        null,
        2
    )
)

const searchFieldsOutput = computed(() =>
    JSON.stringify(
        {
            searchFields1,
            searchFields2,
            searchFields3
        },
        null,
        2
    )
)


/* 기본 column 옵션 */

const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 120,
    sortable: true,
    filter: true,
    resizable: true
}


/* GRID 1 column */

const columns1: ColDef[] = [

    {
        field: 'id',
        headerName: 'ID',
        width: 80,
        checkboxSelection: true,
        headerCheckboxSelection: true
    },

    {
        field: 'name',
        headerName: '이름'
    },

    {
        field: 'department',
        headerName: '부서',
        filter: 'agSetColumnFilter'
    },

    {
        field: 'email',
        headerName: '이메일'
    },

    {
        field: 'grade',
        headerName: '등급',
        width: 72
    },

    {
        field: 'verified',
        headerName: '인증',
        width: 72
    },

    {
        field: 'active',
        headerName: '재직',
        width: 72
    },

    {
        field: 'joinedAt',
        headerName: '입사일',
        width: 120,
        filter: 'agDateColumnFilter'
    },

    {
        field: 'score',
        headerName: '점수',
        filter: 'agNumberColumnFilter'
    }

]


/* GRID 2 column */

const columns2: ColDef[] = [

    {
        field: 'orderId',
        headerName: '주문번호',
        width: 120,
        checkboxSelection: true,
        headerCheckboxSelection: true
    },

    {
        field: 'product',
        headerName: '상품'
    },

    {
        field: 'price',
        headerName: '가격',
        filter: 'agNumberColumnFilter'
    },

    {
        field: 'status',
        headerName: '상태'
    },

    {
        field: 'date',
        headerName: '주문일',
        width: 120,
        filter: 'agDateColumnFilter'
    },

    {
        field: 'shipDate',
        headerName: '출고일',
        width: 120,
        filter: 'agDateColumnFilter'
    }

]


/* GRID 3 column */

const columns3: ColDef[] = [

    {
        field: 'productId',
        headerName: '상품코드',
        width: 120
    },

    {
        field: 'listedAt',
        headerName: '등록일',
        width: 118,
        filter: 'agDateColumnFilter'
    },

    {
        field: 'productImage',
        headerName: '대표이미지',
        width: 220,
        cellRenderer: AppGridCellImage,
        cellRendererParams: {
            triggerText: '대표 이미지 업로드',
            hint: '단일 이미지',
            multiple: false
        }
    },

    {
        field: 'productGallery',
        headerName: '상세이미지',
        width: 260,
        cellRenderer: AppGridCellImage,
        cellRendererParams: {
            triggerText: '상세 이미지 업로드',
            hint: '최대 4개',
            multiple: true,
            maxCount: 4
        }
    },

    {
        field: 'manualFile',
        headerName: '매뉴얼',
        width: 240,
        cellRenderer: AppGridCellFile,
        cellRendererParams: {
            triggerText: '매뉴얼 업로드',
            hint: '단일 파일',
            accept: '.pdf,.doc,.docx',
            multiple: false,
        }
    },

    {
        field: 'attachments',
        headerName: '첨부파일',
        width: 260,
        cellRenderer: AppGridCellFile,
        cellRendererParams: {
            triggerText: '첨부파일 업로드',
            hint: '최대 3개',
            accept: '.pdf,.xlsx,.zip',
            multiple: true,
            maxCount: 3,
        }
    },

    {
        field: 'product',
        headerName: '상품명'
    },

    {
        field: 'category',
        headerName: '카테고리',
        cellRenderer: AppGridCellSelect,
        cellRendererParams: {
            options: [
                { label: '전자기기', value: '전자기기' },
                { label: '주변기기', value: '주변기기' }
            ]
        }
    },

    {
        field: 'price',
        headerName: '가격'
    },

    {
        field: 'stock',
        headerName: '재고',
        cellRenderer: AppGridCellInput,
        cellRendererParams: {
            type: 'number',
            min: 0,
            max: 100
        }
    },

    {
        field: 'state',
        headerName: '상태',
        cellRenderer: AppGridCellChoice,
        suppressHeaderMenuButton: true,
        sortable: false,
        filter: false,
        cellRendererParams: {
            type: 'radio',
            options: [
                { label: '판매중', value: '판매중' },
                { label: '품절', value: '품절' }
            ]
        }
    }

]


/* GRID 1 data */

const rows1 = [

    { id: 1, name: '홍길동', department: '개발', email: 'hong@test.com', score: 88, grade: 'A', verified: 'Y', active: 'Y', joinedAt: '2026-02-01' },
    { id: 2, name: '김민수', department: '디자인', email: 'kim@test.com', score: 72, grade: 'B', verified: 'N', active: 'Y', joinedAt: '2026-03-12' },
    { id: 3, name: '이서연', department: '기획', email: 'lee@test.com', score: 95, grade: 'A', verified: 'Y', active: 'N', joinedAt: '2025-11-20' },
    { id: 4, name: '박지훈', department: '운영', email: 'park@test.com', score: 61, grade: 'C', verified: 'N', active: 'Y', joinedAt: '2026-01-18' },
    { id: 5, name: '최유진', department: '개발', email: 'choi@test.com', score: 84, grade: 'B', verified: 'Y', active: 'Y', joinedAt: '2026-04-05' }

]


/* GRID 2 data */

const rows2 = [

    { orderId: 'ORD-001', product: '노트북', price: 1200000, status: 'READY', date: '2026-03-01', shipDate: '2026-03-03' },
    { orderId: 'ORD-002', product: '키보드', price: 120000, status: 'DELIVERY', date: '2026-03-02', shipDate: '2026-03-05' },
    { orderId: 'ORD-003', product: '마우스', price: 35000, status: 'DONE', date: '2026-03-03', shipDate: '2026-03-04' },
    { orderId: 'ORD-004', product: '모니터', price: 420000, status: 'DELIVERY', date: '2026-03-04', shipDate: '2026-03-10' },
    { orderId: 'ORD-005', product: '태블릿', price: 780000, status: 'READY', date: '2026-03-05', shipDate: '2026-03-06' }

]


/* GRID 3 data */

const rows3 = [

    {
        productId: 'P-001',
        listedAt: '2026-01-08',
        productImage: 'https://picsum.photos/80?random=101',
        productGallery: [
            'https://picsum.photos/80?random=111',
            'https://picsum.photos/80?random=112'
        ],
        manualFile: '/samples/notebook-manual.pdf',
        attachments: [
            '/samples/notebook-spec.pdf',
            '/samples/notebook-warranty.pdf'
        ],
        product: '노트북',
        category: '전자기기',
        price: 1200000,
        stock: 12,
        state: '품절'
    },

    {
        productId: 'P-002',
        listedAt: '2026-02-14',
        productImage: 'https://picsum.photos/80?random=102',
        productGallery: [
            'https://picsum.photos/80?random=121',
            'https://picsum.photos/80?random=122',
            'https://picsum.photos/80?random=123'
        ],
        manualFile: '/samples/keyboard-manual.docx',
        attachments: [
            '/samples/keyboard-layout.pdf',
            '/samples/keyboard-price.xlsx'
        ],
        product: '키보드',
        category: '주변기기',
        price: 120000,
        stock: 34,
        state: '품절'
    },

    {
        productId: 'P-003',
        listedAt: '2026-02-20',
        productImage: 'https://picsum.photos/80?random=103',
        productGallery: [
            'https://picsum.photos/80?random=131'
        ],
        manualFile: '/samples/mouse-manual.pdf',
        attachments: [
            '/samples/mouse-guide.pdf'
        ],
        product: '마우스',
        category: '주변기기',
        price: 35000,
        stock: 50,
        state: '판매중'
    },

    {
        productId: 'P-004',
        listedAt: '2026-03-01',
        productImage: 'https://picsum.photos/80?random=104',
        productGallery: [
            'https://picsum.photos/80?random=141',
            'https://picsum.photos/80?random=142',
            'https://picsum.photos/80?random=143',
            'https://picsum.photos/80?random=144'
        ],
        manualFile: '/samples/monitor-manual.pdf',
        attachments: [
            '/samples/monitor-install.pdf',
            '/samples/monitor-driver.zip',
            '/samples/monitor-checklist.xlsx'
        ],
        product: '모니터',
        category: '전자기기',
        price: 420000,
        stock: 7,
        state: '품절'
    },

    {
        productId: 'P-005',
        listedAt: '2026-03-15',
        productImage: 'https://picsum.photos/80?random=105',
        productGallery: [],
        manualFile: '/samples/tablet-manual.pdf',
        attachments: [],
        product: '태블릿',
        category: '전자기기',
        price: 780000,
        stock: 9,
        state: '판매중'
    }

]

</script>