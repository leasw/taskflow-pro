# 06. Test Report

Swagger(/docs)를 통해 실행 중인 백엔드에 Playwright(browser_evaluate의 fetch)로
05-conventions.md 테스트 매트릭스 10개 케이스를 실제 호출해 검증한 결과다.

- 대상: http://127.0.0.1:8123 (uvicorn 로컬 실행)
- 방법: `/docs` 페이지 컨텍스트에서 JS fetch로 `/api/tasks` 엔드포인트 직접 호출
- 실행일: 2026-09-15

## 결과

| 케이스 | 요청 | 기대 응답 | 실제 응답 | 결과 |
|---|---|---|---|---|
| 정상 생성 | POST title만 | 201 | 201 | PASS |
| 목록 | GET /api/tasks | 200, description 없음 | 200, description 없음 | PASS |
| 단건 | GET /api/tasks/{id} | 200, description 있음 | 200, description 있음 | PASS |
| 수정 | PUT 전 필드 | 200 | 200 | PASS |
| 삭제 | DELETE | 204 | 204 | PASS |
| title 누락 | POST title 없음 | 400 | 400 | PASS |
| status 오값 | 정의되지 않은 status 값 | 400 | 400 | PASS |
| due_at 형식 오류 | 잘못된 날짜/시간 형식 | 400 | 400 | PASS |
| 없는 id | GET/PUT/DELETE에 존재하지 않는 id | 404 | 404 (3건 모두) | PASS |
| 스펙 외 필드 | 스펙에 없는 필드 포함 | 422 | 422 | PASS |

## 요약
- 총 케이스: 10개 (없는 id는 GET/PUT/DELETE 3개 메서드로 각각 확인, 총 실행 12건)
- 통과: 12/12
- 실패: 0

## 비고
- 02-specs.md에 따라 형식 위반(title 누락/status 오값/due_at 형식 오류)은 400,
  스펙 외 필드는 422로 구분되며 두 경로 모두 검증됨.
- Swagger UI(/docs)는 정상 렌더링되며 5개 API(POST/GET 목록/GET 단건/PUT/DELETE)가
  모두 노출됨을 별도로 확인함.
