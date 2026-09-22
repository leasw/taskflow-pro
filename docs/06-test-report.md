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

---

## Phase 3 프론트엔드 검증 (Playwright, 실제 브라우저)

- 대상: http://127.0.0.1:8200 (FastAPI가 frontend/ 정적 파일을 같은 오리진에서 서빙)
- 방법: Playwright로 실제 UI 클릭/입력 조작
- 실행일: 2026-09-22

| 성공 기준 (01-product.md) | 확인 방법 | 결과 |
|---|---|---|
| CRUD 4종 화면 동작 | 추가 → 목록 표시 → 카드 클릭 수정 모달 → 저장 반영 → 휴지통 삭제 확인 다이얼로그 → 삭제 반영 | PASS |
| 새로고침해도 데이터 유지 | 업무 추가 후 페이지 새로고침, 카드 유지 확인 | PASS |
| 테마 토글 작동 | 토글 클릭 시 dark 클래스·아이콘 전환, localStorage 저장, 새로고침 후 유지 확인 | PASS |
| 360px에서 안 깨짐 | 뷰포트 360x640 적용, scrollWidth == clientWidth(가로 스크롤 없음), 스크린샷 확인 | PASS |

### 비고
- due_at은 KST 로컬 입력(`datetime-local`) → UTC로 변환해 서버 저장, 응답은 다시 로컬로
  변환해 "날짜 · 남은 시간" 형태로 표시됨을 확인.
- 03-design.md에 따라 3초 폴링(`setInterval`)으로 목록이 갱신됨.
