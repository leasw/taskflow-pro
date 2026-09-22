# 04. Tasks

MVP는 아래 3개 Phase로 진행한다. Phase 이름과 개수는 고정이며 변경하지 않는다.

- `backend 진행해` = Phase 2 전체
- `frontend 진행해` = Phase 3 전체

## 진행 규칙
- 순서대로만 진행 (Phase 1 → 2 → 3, 각 Phase 내부도 단계 순서대로)
- 병렬 금지
- 단계별 검증 필수 (검증 방법 열을 통과해야 다음 단계로 이동)

## Phase 2 의존성
`fastapi`, `uvicorn`, `sqlalchemy`, `pytest`, `httpx` 로 한정한다.

---

## Phase 1 (설계) - CLAUDE.md + docs/ 6종 작성

| 단계 | 검증 방법 | 완료 |
|---|---|---|
| 1. CLAUDE.md 작성 | 4개 섹션(역할/스택/절차/절대규칙) 존재 확인 | [x] |
| 2. docs/ 폴더 및 6개 파일 생성 | 파일명·개수 6개 일치 확인 | [x] |
| 3. 00-overview.md 작성 | 매핑표·읽는 순서·분리 이유 포함 확인 | [x] |
| 4. CLAUDE.md와 docs 파일명 일치 검증 | 이름·순서 6개 대조 | [x] |
| 5. 01-product.md 작성 | 목표/페르소나/MVP 범위 포함 확인 | [x] |
| 6. 01-product.md 성공 기준 추가 | 4개 항목(새로고침 유지 등) 존재 확인 | [x] |
| 7. 02-specs.md 작성 | Task 모델 7필드·검증 규칙·API 5개 포함 확인 | [x] |
| 8. 02-specs.md 화면 명세 추가 | 화면별 표 4개 존재 확인 | [x] |
| 9. 03-design.md 작성 | 8행 표(선택/대안/근거/트레이드오프) 확인 | [x] |
| 10. 03-design.md 의존성 정책 확인 | httpx 사전 승인 목록 포함 확인 | [x] |

---

## Phase 2 (백엔드) - backend/ FastAPI > CRUD API 5개 > Swagger 확인

| 단계 | 검증 방법 | 완료 |
|---|---|---|
| 1. backend/ 폴더 및 의존성 설치 | requirements.txt에 5개 패키지만 존재 확인 | [x] |
| 2. SQLAlchemy 모델 정의 (Task, 7필드) | 02-specs.md 필드 순서·타입과 대조 | [x] |
| 3. DB 세션/엔진 설정 (SQLite) | 앱 기동 시 DB 파일 생성 확인 | [x] |
| 4. Pydantic 스키마 정의 (요청/응답 분리) | 목록 응답에 description 제외 확인 | [x] |
| 5. POST /api/tasks 구현 | 201 응답, 스펙 외 필드 422 확인 | [x] |
| 6. GET /api/tasks (목록) 구현 | 200 응답, description 미포함 확인 | [x] |
| 7. GET /api/tasks/{id} (단건) 구현 | 200/404, description 포함 확인 | [x] |
| 8. PUT /api/tasks/{id} 구현 | 200/400/404 응답 확인 | [x] |
| 9. DELETE /api/tasks/{id} 구현 | 204/404 응답 확인 | [x] |
| 10. pytest 전체 통과 + Swagger(/docs) 확인 | 테스트 전부 통과, /docs에서 5개 API 노출 확인 | [x] |

---

## Phase 3 (프론트) - frontend/ HTML+JS+Tailwind > 화면 > API 연결 > git push

| 단계 | 검증 방법 | 완료 |
|---|---|---|
| 1. index.html 기본 골격 + Tailwind CDN 연결 | 브라우저에서 페이지 로드 확인 | [x] |
| 2. 추가 폼 UI (title/due_at/status) | 폼 요소 렌더링 확인 | [x] |
| 3. 목록 카드 UI (status 배지, 남은 시간) | 더미 데이터로 카드 렌더링 확인 | [x] |
| 4. 수정 모달 UI (전 필드) | 카드 클릭 시 모달 오픈 확인 | [x] |
| 5. 삭제 확인 다이얼로그 UI | 휴지통 클릭 시 확인창 노출 확인 | [x] |
| 6. app.js에서 API 연동 (CRUD 4종) | 실제 백엔드 응답으로 화면 갱신 확인 | [x] |
| 7. 테마 토글 + 반응형(360px) 적용 | localStorage 유지, 360px에서 레이아웃 확인 | [x] |
| 8. 전체 동작 확인 후 git add/commit/push | 성공 기준 4가지 통과 후 원격 반영 확인 | [x] |
