# 헬스픽 🥗 — 더 건강한 음식 고르기

쿠팡에서 실시간으로 검색되는 식품의 **주요 영양 성분(열량·단백질·당류·나트륨 등)을 나란히 비교**해서 더 건강한 선택을 돕고, 마음에 드는 상품은 **쿠팡 파트너스 제휴 링크**로 바로 구매할 수 있는 웹앱입니다.

## 핵심 기능

- 🔎 **실시간 쿠팡 검색** — 쿠팡 파트너스 Open API로 상품을 검색
- 🥗 **영양 성분 비교** — 100g 기준 8개 항목을 표로 비교, 항목별 최우수값 강조
- 🏆 **건강 점수** — 단백질·식이섬유(+) / 당류·포화지방·나트륨·열량(−)을 종합한 0~100점
- 🛒 **수익화** — "쇼핑하기" 클릭 시 내 파트너스 제휴 링크로 연결되어 수익 발생

## 동작 방식

쿠팡은 영양 성분을 API로 제공하지 않으므로, 상품명을 내장 영양 DB(식약처 식품영양성분 데이터 기반)와 매칭해 영양 정보를 산출합니다.

- 쿠팡 API **키가 있으면** → 실시간 검색 + 실제 제휴 링크
- 키가 **없으면** → 데모 데이터로 UI/비교 기능을 그대로 체험 가능

## 시작하기

```bash
npm install
npm run dev
# http://localhost:3000
```

### 실시간 쿠팡 검색 활성화

1. [쿠팡 파트너스](https://partners.coupang.com)에서 Open API 키를 발급받습니다.
2. `.env.example` 을 `.env.local` 로 복사하고 값을 채웁니다.

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
| --- | --- |
| `COUPANG_ACCESS_KEY` | 파트너스 액세스 키 |
| `COUPANG_SECRET_KEY` | 파트너스 시크릿 키 |
| `COUPANG_SUB_ID` | (선택) 채널/서브 트래킹 코드 |

## 기술 스택

Next.js (App Router) · React · TypeScript · Tailwind CSS

## 프로젝트 구조

```
src/
  app/
    api/search/route.ts   # 검색 API (쿠팡 호출 + 영양 매칭)
    page.tsx              # 메인 화면 (검색·결과·비교 트레이)
  components/             # ProductCard, ComparisonTable, HealthScoreBadge
  lib/
    coupang.ts            # 쿠팡 파트너스 API (HMAC 서명) + 데모 폴백
    nutrition.ts          # 영양 DB + 매칭 + 건강 점수
    types.ts, format.ts
```

## 면책

영양 성분은 100g 기준 대표값으로 실제 제품과 다를 수 있습니다. 본 서비스는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
