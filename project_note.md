# Framework 프로젝트 노트

Nuxt 3 + Pinia + Axios 기반의 워크스페이스/컴포넌트 데모 프로젝트입니다.  
이 문서는 유지보수에 필요한 핵심만 짧게 정리합니다.

---

## 1) 기술 스택

- 프레임워크: `Nuxt 3` (Vite/Nitro 포함)
- 상태관리: `Pinia`
- HTTP: `Axios` (`$api` 주입 + `useApi()` 사용)
- UI/기능: AG Grid, Chart.js, Toast UI Editor, SCSS

---

## 2) 실행 명령어

- 개발: `npm run dev`
- 빌드: `npm run build`
- 미리보기: `npm run preview`
- 정적 생성: `npm run generate`
- GitHub Pages 배포: `npm run generate:gh-pages`

배포 URL: [https://yheun03.github.io/singil-bmc/](https://yheun03.github.io/singil-bmc/)  
(`NUXT_APP_BASE_URL=/singil-bmc/`, `nuxt.config.ts`의 `app.baseURL`과 동일)

---

## 3) 폴더 가이드

```text
app.vue                # 앱 최상위 래퍼. 전역 모달/레이아웃 연결만 둡니다.
assets/                # SCSS, 폰트, 아이콘 원본. 런타임에서 직접 호출하는 정적 파일은 public/에 둡니다.
components/            # 재사용 UI 컴포넌트. 업무 데이터 호출이나 라우팅 정책은 넣지 않습니다.
composables/           # 화면/컴포넌트 조합 로직. Nuxt auto-import 대상입니다.
i18n/                  # 현재 프로젝트의 간단한 메시지 사전. 키 추가는 ko/en을 같이 맞춥니다.
layouts/               # 페이지 공통 레이아웃. 기본 레이아웃은 layouts/default.vue입니다.
pages/                 # Nuxt file-based routing 화면. URL 구조와 파일명이 직접 연결됩니다.
plugins/               # Nuxt 플러그인. axios, iconify, client-only 초기화처럼 앱 시작 시 필요한 코드만 둡니다.
public/                # 빌드 후 그대로 배포되는 정적 파일. 예: favicon, 샘플 PDF.
router/                # 라우트 표시/탭 제목 같은 라우팅 정책 유틸.
server/api/            # Nitro 서버 API route handlers. 파일명이 HTTP endpoint가 됩니다.
stores/                # Pinia store. 상태, 캐시, 로딩, 액션을 관리합니다.
types/                 # 여러 영역에서 공유하는 타입과 모듈 선언.
scripts/               # 저장소 운영/동기화용 Node 스크립트.
```

컴포넌트 하위 폴더 규칙:

- `components/Table`, `components/Section`, `components/Layout`, `components/Modal`은 Nuxt 설정에서 prefix 없이 자동 등록합니다.
- `components/AppGrid`처럼 기능 단위 컴포넌트는 폴더로 묶고, 진입점이 있으면 `index.vue`를 사용합니다.
- 루트 단일 컴포넌트는 `AppButton.vue`처럼 `App` prefix를 유지합니다.

페이지 규칙:

- `pages/demos/*`는 컴포넌트 사용 예시입니다. 실제 업무 화면과 공통 컴포넌트 로직을 섞지 않습니다.
- 파일명은 라우트가 되므로 오탈자 없이 kebab-case를 사용합니다. 예: `demo-accordion.vue`.
- 새 페이지가 LNB에 보여야 하면 `stores/navigation.ts`의 `MENU_SEED`와 `i18n/*`의 label key를 함께 추가합니다.

---

## 4) API 호출 규칙

- 공통 규칙: **직접 Axios 인스턴스 사용 금지**, `useApi()` 사용
- 엔드포인트 표기: `/api/*`
- 서버/클라이언트 환경 차이는 `composables/useApi.ts`에서 처리
- Axios 인스턴스 설정은 `plugins/axios.ts`에서만 바꿉니다.

예시:

```ts
const api = useApi();
const data = await api.get<MyType>('/api/menus');
```

---

## 5) 상태관리 규칙(Pinia)

- Store는 상태/로딩/캐시/액션 중심으로 유지
- 도메인 가공 로직(트리 변환, 번역 적용 등)은 `stores`/`composables`에 배치
- 컴포넌트는 가능하면 store/composable만 사용

---

## 6) Navigation/Route 규칙

- 메뉴 타입 단일 소스: `types/navigation.ts`
- 메뉴 트리/번역 처리(및 seed 생성): `stores/navigation.ts`
- 내비게이션 렌더링: `components/Layout/LayoutNav.vue`
- 라우트 제목/가시성 규칙: `router/index.ts`
- 탭 동기화: `plugins/route-tabs.client.ts`

---

## 7) 서버 API

- 서버 공통 API는 “export 등” 기능 중심으로 유지합니다.
- `POST /api/export/excel`: 그리드 데이터 엑셀 변환/다운로드

---

## 8) 개발 원칙(요약)

- 중복 타입/로직 생성 금지(단일 소스 유지)
- 임시 호환 레이어(re-export) 남기지 않기
- 새 기능 추가 위치
    - 라우트/정책: `router`
    - Nuxt 플러그인/주입: `plugins`
    - 클라이언트 API 호출: `composables/useApi.ts`
    - 서버 API 엔드포인트: `server/api`
    - 상태 관리: `stores`
    - 전역 타입/모듈 선언: `types`

---

## 9) 통폐합 기준

- 단순히 다른 함수를 한 번 감싸는 composable은 만들지 않습니다. 호출부가 하나뿐이면 호출부에 직접 둡니다.
- 서버 API 호출 공통 로직은 `useApi()` 하나로 모읍니다.
- store는 여러 화면에서 공유되는 상태가 있을 때만 만듭니다. 한 화면 안에서 끝나는 상태는 page/component 내부에 둡니다.
- 타입은 두 곳 이상에서 공유되거나 public prop/event 계약이면 `types/`로 올립니다. 한 컴포넌트 전용 타입은 해당 `.vue` 안에 둡니다.

---

필요 시 이 문서에 “어디에 무엇을 추가했고 왜 그렇게 했는지”만 1~2줄로 누적 기록합니다.

- 2026-04-28: `types/modal.ts`에 모달 공통 props/event reason 타입을 모아 모달 컴포넌트들의 중복 선언을 줄였습니다.
- 2026-04-28: `stores/modal.ts`와 `components/Modal/AppModalHost.vue`를 공통 경로로 정리해 분기 수를 줄이면서 기존 Alert/Confirm/Custom 동작은 유지했습니다.
- 2026-04-28: `useModalViewer()`와 PDF/이미지 뷰어 콘텐츠를 추가해 `AppUploadFile`의 PDF 미리보기와 `AppUploadImage`의 이미지 미리보기 모달을 연결했습니다.
- 2026-04-28: `pages/demos/demo-modal.vue`에 이미지/PDF 뷰어 예제를 추가해 업로드 컴포넌트 밖에서도 뷰어 모달 사용 방식을 바로 확인할 수 있게 했습니다.
- 2026-04-28: `AppTable` 기본 stacked 컬럼 폭과 `AppTableField`의 select/email 처리 로직을 보정해 빈 값 placeholder와 이메일 입력 레이아웃이 의도대로 동작하게 했습니다.
- 2026-04-29: navigation/LNB를 공통 구조로 재흡수했습니다. 메뉴 seed는 `stores/navigation.ts`로 이동해 static prerender에서 `/api/menus` 의존성을 제거했습니다.
- 2026-05-24: Jonsoft 로고·`/jonsoft-framework/` base를 Framework·`/framework/`로 정리하고, GitHub Actions(`gh-pages.yml`)로 Pages 자동 배포를 추가했습니다.
- 2026-05-25: `core` 구조를 Nuxt 루트 구조로 분리하고, 얇은 래퍼였던 `useApiClient`/`useNavigation`과 미사용 `useModalStack`을 통폐합했습니다.
