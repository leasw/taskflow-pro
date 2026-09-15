# 05. Conventions

## 명명 규칙
- 백엔드: snake_case
- 프론트: camelCase
- 컴포넌트: PascalCase
- 식별자는 영어로 작성, 주석만 한국어로 작성

## 금지 5개

| 금지 | 이유 | 대안 |
|---|---|---|
| print 디버깅 | 노이즈 | logging 모듈 |
| bare except | 예외 삼킴 | except SpecificError |
| 비밀번호 하드코딩 | 보안사고 | .env + os.getenv |
| any 타입(TS) | 의미 상실 | 명시적 타입 |
| !important | 우선순위 꼬임 | 셀렉터 개선 |

## .gitignore 추가 항목
- `__pycache__/`
- `.venv/`
- `*.db`
- `*.log`

## 테스트 매트릭스

| 케이스 | 요청 | 기대 응답 |
|---|---|---|
| 정상 생성 | POST title만 | 201 |
| 목록 | GET /api/tasks | 200, description 없음 |
| 단건 | GET /api/tasks/{id} | 200, description 있음 |
| 수정 | PUT 전 필드 | 200 |
| 삭제 | DELETE | 204 |
| title 누락 | POST title 없음 | 400 |
| status 오값 | 정의되지 않은 status 값 | 400 |
| due_at 형식 오류 | 잘못된 날짜/시간 형식 | 400 |
| 없는 id | 존재하지 않는 id로 조회/수정/삭제 | 404 |
| 스펙 외 필드 | 스펙에 없는 필드 포함 | 422 |

## Git 커밋 규칙
- 접두사: `feat` / `fix` / `docs` / `refactor` / `test` / `chore`
- 접두사 뒤에 한국어로 요약 작성
- 예: `docs: Phase 1 설계 문서 7종 작성`
