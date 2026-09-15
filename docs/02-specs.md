# 02. Specs

## Task 모델 필드 (7개, 이 순서·타입 고정)

| 순서 | 필드 | 타입 | 제약 |
|---|---|---|---|
| 1 | id | INTEGER | PK, AUTOINCREMENT |
| 2 | title | VARCHAR(200) | 필수 |
| 3 | description | TEXT | 선택 |
| 4 | status | todo / in_progress / done | 기본값 todo |
| 5 | due_at | DATETIME (UTC) | 선택 |
| 6 | created_at | DATETIME | 서버 자동 |
| 7 | updated_at | DATETIME | 서버 자동 |

## 검증
- title / status / due_at 형식 위반 → 400
- 없는 id → 404
- 스펙에 없는 필드가 오면 → 422로 거부 (조용히 무시 금지)
- due_at은 UTC로 저장하고 화면에서 로컬 시간으로 변환하여 표시
- 응답의 날짜 세 필드(due_at, created_at, updated_at)는 UTC ISO 8601 형식으로 통일

## 응답 필드 범위
- 목록(GET /api/tasks): description 제외
- 단건(GET /api/tasks/{id}): description 포함

## 화면 명세

### 추가 - 폼

| 필드 | 설명 |
|---|---|
| title | 필수 입력 |
| due_at | 마감 시각 선택 (날짜 + 시간) |
| status | 상태 선택 |

### 목록 - 카드

| 요소 | 설명 |
|---|---|
| status 배지 | 상태를 색상/텍스트로 표시 |
| 마감까지 남은 시간 | due_at 기준 남은 시간 표시 |

### 수정 - 카드 클릭 > 모달

| 요소 | 설명 |
|---|---|
| 진입 방식 | 카드 클릭 시 모달 오픈 |
| 수정 가능 필드 | 전 필드(title, description, status, due_at) 수정 가능 |

### 삭제 - 휴지통 > 확인 > DELETE

| 요소 | 설명 |
|---|---|
| 진입 방식 | 카드의 휴지통 아이콘 클릭 |
| 확인 절차 | 확인 다이얼로그 통과 후 진행 |
| API 호출 | DELETE /api/tasks/{id} |

## REST API (5개, 경로는 `/api/` 접두사 필수)

| Method | Path | 성공 응답 |
|---|---|---|
| POST | /api/tasks | 201 |
| GET | /api/tasks | 200 (목록) |
| GET | /api/tasks/{id} | 200 (단건) |
| PUT | /api/tasks/{id} | 200 |
| DELETE | /api/tasks/{id} | 204 |
