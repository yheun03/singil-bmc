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

홈페이지 라우트는 `pages/` 아래에 두었습니다. `nuxt.config`의 `pages:extend` 훅으로 데모·인증을 제외한 페이지에 `site` 레이아웃을 적용합니다.  
프레임워크 데모(`pages/demos/`, `pages/workspace.vue` 등)는 기존 `layouts/default.vue`를 그대로 사용합니다.

```text
pages/
  index.vue               # 홈
  about/index.vue         # 선교단 소개
  about/leaders.vue       # 조직/섬김이
  about/history.vue       # 히스토리
  gallery/team.vue        # 단체사진
  records/index.vue       # 전체 기록
  records/yearly.vue      # 연도별 기록
  records/monthly.vue     # 월별 기록
  records/groups.vue      # 조별 기록
  mvp/monthly.vue         # 월별 MVP
  mvp/weekly.vue          # 주간 MVP
  players/                # 선수 명단
  games/                  # 경기
  videos/index.vue        # YouTube 영상
  news/index.vue          # 소식 목록
  news/[slug].vue         # 소식 상세
  contact/index.vue       # 문의
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

| 경로                           | 설명                   |
| ------------------------------ | ---------------------- |
| `raw-games/*.html`             | 게임원 table HTML 저장 |
| `games/*.json`                 | 경기별 파싱 결과       |
| `summary/batting-total.json`   | 타자 누적 기록         |
| `summary/pitching-total.json`  | 투수 누적 기록         |
| `summary/team-total.json`      | 팀 요약                |
| `summary/players-total.json`   | 선수별 통합 기록       |
| `summary/yearly-records.json`  | 연도별 기록            |
| `summary/monthly-records.json` | 월별 기록              |
| `summary/group-records.json`   | A조/D조 기록           |
| `summary/mvp-monthly.json`     | 월별 MVP (수동)        |
| `summary/mvp-weekly.json`      | 주간 MVP (수동)        |
| `meta/players.json`            | 선수 마스터            |
| `meta/leaders.json`            | 운영진                 |
| `meta/history.json`            | 연혁                   |
| `meta/videos.json`             | YouTube 영상 목록      |
| `meta/gallery.json`            | 단체사진               |
| `meta/news.json`               | 소식                   |

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

경기 종료 후 운영 절차는 [GAME_RECORD_UPDATE_HANDOFF.md](./GAME_RECORD_UPDATE_HANDOFF.md)를 기준으로 진행합니다.

핵심 명령어:

```bash
npm run update
```

요약:

- `public/data/raw-games/*.html`만 기준으로 자동 생성 데이터를 초기화 후 재생성합니다.
- `Davids 야구 선교단` 경기는 A조, `다윗 야구 선교단` 경기는 D조로 자동 구분합니다.
- 상대팀 선수 기록은 누적 타자/투수 기록에 포함하지 않습니다.
- `public/data/manual/youtube-links.json`은 수동 관리 파일이며 update 시 삭제하지 않습니다.

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

| 파일                           | 설명                    |
| ------------------------------ | ----------------------- |
| `nuxt.config.ts`               | baseURL, static preset  |
| `composables/useBasePath.ts`   | GitHub Pages 경로 유틸  |
| `stores/navigation.ts`         | GNB 메뉴                |
| `scripts/parse-game-html.js`   | HTML 파싱               |
| `scripts/build-records.js`     | 누적 기록 생성          |
| `scripts/update-records.js`    | parse + build 일괄 실행 |
| `scripts/lib/records-utils.js` | 파싱/계산 공통 유틸     |

---

## 팀 Git 동기화 (참고)

framework → 팀 GitLab 동기화 절차는 기존 `scripts/sync-team-repo.mjs` 및 `npm run sync:team`을 사용합니다.  
자세한 내용은 저장소 내 sync 관련 문서를 참고하세요.
