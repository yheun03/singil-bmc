# 신길교회 야구 선교단 (singil-bmc)

GitHub Pages에 정적으로 배포되는 **신길교회 야구 선교단** 홈페이지입니다.  
서버 API 없이, 빌드 전 Node.js 스크립트로 경기 HTML을 JSON으로 변환하고 프론트에서 정적 JSON을 fetch해 화면을 렌더링합니다.

- **배포 주소:** https://yheun03.github.io/singil-bmc/
- **baseURL:** `/singil-bmc/`

---

## 기술 스택

- **프레임워크:** Nuxt 3 (Vite / Nitro static preset)
- **UI:** Vue 3, SCSS (BEM), 기존 framework 컴포넌트
- **상태관리:** Pinia
- **기록 파싱:** Node.js + cheerio
- **배포:** GitHub Pages

---

## 페이지 구조

홈페이지는 `pages/(site)/` 라우트 그룹에 두었습니다. URL에는 `(site)`가 포함되지 않습니다.  
프레임워크 데모(`pages/demos/`, `pages/workspace.vue` 등)는 기존 `layouts/default.vue`를 그대로 사용합니다.

```text
pages/
  (site).vue              # site 레이아웃 래퍼
  (site)/
    index.vue             # 홈
    about/index.vue       # 선교단 소개
    about/leaders.vue     # 조직/섬김이
    about/history.vue     # 히스토리
    gallery/team.vue      # 단체사진
    records/index.vue     # 전체 기록
    records/yearly.vue    # 연도별 기록
    records/monthly.vue   # 월별 기록
    records/groups.vue    # 조별 기록
    mvp/monthly.vue       # 월별 MVP
    mvp/weekly.vue        # 주간 MVP
    videos/index.vue      # YouTube 영상
    news/index.vue        # 소식 목록
    news/[slug].vue       # 소식 상세
    contact/index.vue     # 문의
  demos/                  # framework UI 데모
  workspace.vue           # framework 워크스페이스
```

---

## 데이터 디렉터리 구조

```text
public/data/
  raw-games/          # 게임원 경기 기록 HTML (입력)
  games/              # 경기별 JSON (자동 생성)
  summary/            # 누적 기록 JSON (자동 생성)
  meta/               # 선수, 운영진, 갤러리, 영상, 소식 (수동 관리)
```

| 경로 | 설명 |
| --- | --- |
| `raw-games/*.html` | 게임원 table HTML 저장 |
| `games/*.json` | 경기별 파싱 결과 |
| `summary/batting-total.json` | 타자 누적 기록 |
| `summary/pitching-total.json` | 투수 누적 기록 |
| `summary/team-total.json` | 팀 요약 |
| `summary/players-total.json` | 선수별 통합 기록 |
| `summary/yearly-records.json` | 연도별 기록 |
| `summary/monthly-records.json` | 월별 기록 |
| `summary/group-records.json` | A조/D조 기록 |
| `summary/mvp-monthly.json` | 월별 MVP (수동) |
| `summary/mvp-weekly.json` | 주간 MVP (수동) |
| `meta/players.json` | 선수 마스터 |
| `meta/leaders.json` | 운영진 |
| `meta/history.json` | 연혁 |
| `meta/videos.json` | YouTube 영상 목록 |
| `meta/gallery.json` | 단체사진 |
| `meta/news.json` | 소식 |

---

## 개발 실행

```bash
npm install
npm run dev
```

로컬 개발 시에도 `nuxt.config.ts`의 `app.baseURL`이 `/singil-bmc/`으로 설정되어 GitHub Pages와 동일한 경로 기준으로 동작합니다.

JSON fetch는 `composables/useBasePath.ts`의 `fetchJson()` / `getDataPath()`를 사용합니다.

```ts
const { fetchJson } = useBasePath();
const teamTotal = await fetchJson('summary/team-total.json');
```

---

## 기록 갱신 절차

경기 종료 후 아래 순서로 기록을 갱신합니다.

### 1. 경기 HTML 저장

게임원 경기 기록 페이지에서 **table 태그가 포함된 HTML**을 저장합니다.

### 2. raw-games 폴더에 추가

`public/data/raw-games/` 폴더에 아래 형식으로 파일을 추가합니다.

```text
yyyy-mm-dd-vs-opponent.html
```

예시:

게임원 경기 기록 페이지 HTML(`.article.on`, `summary="타자기록"`, `summary="투수기록"`)을 그대로 저장해도 파싱됩니다.  
**다윗 야구 선교단** 팀 테이블만 추출하며, `game_sum`에서 홈런/2루타/3루타도 반영합니다.

```text
public/data/raw-games/2025-09-28-vs-11st-wyverns.html
```

### 3. JSON 생성 명령어 실행

```bash
npm run records:update
```

내부 동작:

1. `public/data/raw-games/*.html` 전체 파싱
2. `public/data/games/{gameId}.json` 생성
3. `public/data/games/*.json` 전체를 다시 읽어 summary 재계산
4. `public/data/summary/*.json` 갱신

개별 실행:

```bash
npm run records:parse   # HTML → games JSON
npm run records:build   # games → summary JSON
```

> summary는 **기존 JSON에 덧셈하지 않고**, games 폴더 전체를 매번 재계산합니다.  
> 특정 HTML을 수정한 뒤 다시 실행하면 전체 기록이 정확히 재생성됩니다.

### 4. 생성 결과 확인

- `public/data/games/`
- `public/data/summary/`

### 5. 로컬 화면 확인

```bash
npm run dev
```

`/records` 등 기록 페이지에서 JSON이 정상 표시되는지 확인합니다.

### 6. 커밋 및 배포

이상 없으면 변경된 JSON과 HTML을 커밋한 뒤 `main` 브랜치에 push하면 GitHub Actions가 GitHub Pages에 배포합니다.

---

## 빌드 / 배포

```bash
# 정적 생성
npm run generate

# GitHub Pages 로컬 배포 (gh-pages CLI)
npm run generate:gh-pages
```

GitHub Actions(`.github/workflows/gh-pages.yml`)는 `NUXT_APP_BASE_URL=/singil-bmc/` 환경 변수로 generate 후 배포합니다.

---

## 선수 매칭

HTML의 선수명은 `public/data/meta/players.json`의 `gameoneName`과 매칭됩니다.  
매칭되지 않는 선수는 임시 `playerId`가 생성되고 콘솔에 warning이 출력됩니다.

```text
[WARN] players.json에서 매칭되지 않은 선수명: "홍길동"
```

조(A/D) 정보는 `players.json`의 `group` 값을 우선 사용합니다.

---

## 관련 파일

| 파일 | 설명 |
| --- | --- |
| `nuxt.config.ts` | baseURL, static preset |
| `composables/useBasePath.ts` | GitHub Pages 경로 유틸 |
| `stores/navigation.ts` | GNB 메뉴 |
| `scripts/parse-game-html.js` | HTML 파싱 |
| `scripts/build-records.js` | 누적 기록 생성 |
| `scripts/update-records.js` | parse + build 일괄 실행 |
| `scripts/lib/records-utils.js` | 파싱/계산 공통 유틸 |

---

## 팀 Git 동기화 (참고)

framework → 팀 GitLab 동기화 절차는 기존 `scripts/sync-team-repo.mjs` 및 `npm run sync:team`을 사용합니다.  
자세한 내용은 저장소 내 sync 관련 문서를 참고하세요.
