# 경기 기록 갱신 인수인계

경기 후 GameOne HTML을 사이트에 반영하는 방법입니다.

## 경기 후 이렇게 하면 됩니다

```bash
# 1. GameOne 경기 기록 HTML 저장
#    → public/data/raw-games/YYYY-MM-DD-vs-slug.html

# 2. (선택) 시즌 개막일·연도별 우리팀명·조 수정
#    → public/data/manual/seasons.json
#    → public/data/manual/season-teams.json

# 3. (선택) 경기 영상 링크 추가
#    → public/data/manual/youtube-links.json

# 4. 데이터 갱신
npm run update

# 5. 화면 확인
npm run dev

# 6. 커밋
#    raw-games HTML + generated/summary JSON (+ manual JSON)
```

### HTML 저장

- 위치: `public/data/raw-games/`
- 파일명: `YYYY-MM-DD-vs-slug.html` (slug는 URL용, 아무 영문이면 됨)
- 예: `2026-05-30-vs-11stwyverns.html`

**상대팀 이름은 파일명이 아니라 HTML 안 `h4`에서 자동 추출됩니다.**

게임요약(`.summary .score_sum`)의 `h4` 중 `다윗 야구 선교단` / `Davids 야구 선교단`이 **아닌** 팀명이 화면에 표시되는 상대팀입니다.

| h4 예시                                     | 결과                        |
| ------------------------------------------- | --------------------------- |
| `11번가 와이번스` vs `다윗 야구 선교단`     | 상대: **11번가 와이번스**   |
| `Davids 야구 선교단` vs `동국대학교 LAE OB` | 상대: **동국대학교 LAE OB** |

### 조(A/D) · 우리팀명 (연도별 설정)

HTML `.record h3` / 게임요약 `h4`의 **우리팀명**으로 조를 판정합니다. 팀명·조 매핑은 연도마다 다를 수 있어 `public/data/manual/season-teams.json`에서 지정합니다.

```json
{
    "fallback": {
        "groups": [
            { "id": "A", "label": "A조", "teamNames": ["Davids 야구 선교단"] },
            { "id": "D", "label": "D조", "teamNames": ["다윗 야구 선교단"] }
        ]
    },
    "seasons": {
        "2026": {
            "groups": [
                { "id": "A", "label": "A조", "teamNames": ["Davids 야구 선교단"] },
                { "id": "D", "label": "D조", "teamNames": ["다윗 야구 선교단"] }
            ]
        },
        "2027": {
            "groups": [
                { "id": "A", "label": "A조", "teamNames": ["새 시즌 A팀 정식명"] },
                { "id": "D", "label": "D조", "teamNames": ["새 시즌 D팀 정식명"] }
            ]
        }
    }
}
```

- `seasons`의 키는 **시즌 연도**입니다. 경기일(파일명)과 다를 수 있습니다.
- `teamNames`는 GameOne에 표시된 팀명과 **포함 관계**로 매칭됩니다(긴 이름을 먼저 비교).
- 해당 연도 설정이 없으면 `fallback`을 사용합니다.
- `npm run update` 후 `public/data/meta/season-teams.json`에도 동일 내용이 복사됩니다.

| 2026년 예시 팀명      | 조  |
| --------------------- | --- |
| `Davids 야구 선교단`  | A조 |
| `다윗 야구 선교단`    | D조 |

### 시즌 연도 (경기일과 분리)

리그 시즌은 달력 연도와 다를 수 있습니다. 예: 2026-01-03 경기는 2025 시즌에 속할 수 있습니다.

`public/data/manual/seasons.json`:

```json
{
    "boundaries": [
        { "season": 2026, "startDate": "2026-01-31" },
        { "season": 2025, "startDate": "2025-03-01" }
    ]
}
```

- `boundaries`: 시즌 개막일 목록. 경기일이 `startDate` 이상인 **가장 최근** 시즌에 포함됩니다.
- 파일명 날짜(`gameDate`)는 **실제 경기일** 그대로 유지합니다.
- 연도별 기록·조 판정은 `seasonYear`를 사용합니다.
- 개별 경기만 예외 처리하려면 `game-overrides.json`에 `"seasonYear": 2025`를 추가합니다.

```json
{
    "2026-01-03-vs-cubs2": { "seasonYear": 2025 }
}
```

- `npm run update` 후 `public/data/meta/seasons.json`에도 복사됩니다.

### YouTube 영상 (선택)

`public/data/manual/youtube-links.json`:

```json
{
    "2026-05-30-vs-11stwyverns": {
        "videoCode": "VIDEO_ID",
        "title": "2026.05.30 11번가 와이번스전 경기 영상",
        "publishedAt": "2026-06-01"
    }
}
```

key는 `gameId`(파일명에서 `.html` 제거)입니다.

### 확인할 페이지

| 페이지            | 확인                          |
| ----------------- | ----------------------------- |
| `/games`          | 새 경기 카드, **상대팀 이름** |
| `/games/{gameId}` | 점수, 요약, 하이라이트        |
| `/` (홈)          | 최근 경기 **상대팀 이름**     |
| `/records`        | 타자·투수 누적 기록           |

---

## 커밋 전 체크

- [ ] HTML을 `public/data/raw-games/`에 넣었다
- [ ] `npm run update` 성공
- [ ] `/games`에서 **상대팀 이름이 h4와 일치**한다
- [ ] A조/D조가 맞다
- [ ] (선택) YouTube 링크 추가
- [ ] raw HTML + generated JSON 커밋

---

## 참고 (파서 규칙)

### 우리팀 기록만 파싱

- `.record` 내부 `h3` 팀명 확인 → 우리팀일 때만 바로 다음 `table` 파싱
- 전체 테이블 훑기(`document.querySelectorAll('.record_table')`) 사용 안 함

### 게임 요약

`.summary .score_sum`에서 파싱:

- 우리팀/상대팀 요약 스탯
- `h4` → 상대팀명 (`opponentName`)
- `ul.game_sum` → 하이라이트

### `npm run update`가 하는 일

1. `raw-games/*.html` 파싱 → `games/*.json` 생성
2. 시즌/월간/조별 기록, MVP, 뉴스, 영상 목록 생성
3. `manual/youtube-links.json` 병합

### 생성되는 파일

```text
public/data/games/*.json
public/data/summary/*.json
public/data/generated/*.json
```

`manual/` 아래 파일(`players.json`, `news.json` 등)은 **삭제하지 않음**.

### 문제 해결

| 증상                   | 확인                                                |
| ---------------------- | --------------------------------------------------- |
| 경기 수 안 늘어남      | 확장자 `.html`, 파일명 `YYYY-MM-DD-vs-*.html`       |
| 상대팀 이름 틀림       | HTML `h4` 내용 확인 (파일명 slug와 무관)            |
| 조가 틀림              | `.record h3`에 `Davids` / `다윗` 팀명 있는지        |
| 기록이 비정상적으로 큼 | 같은 경기 HTML 중복 저장 여부                       |
| 영상 안 나옴           | `youtube-links.json` key = `gameId`                 |
| 선수명 경고            | `players.json`의 `gameoneName`과 HTML 선수명 맞추기 |
