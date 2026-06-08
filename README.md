# 헬스픽 🥗 — 더 건강한 음식 고르기

쿠팡에서 실시간으로 검색되는 식품의 **주요 영양 성분(열량·단백질·당류·나트륨 등)을 나란히 비교**해서 더 건강한 선택을 돕고, 마음에 드는 상품은 **쿠팡 파트너스 제휴 링크**로 바로 구매할 수 있는 웹앱입니다.

## 핵심 기능

- 🔎 **실시간 쿠팡 검색** (`/`) — 쿠팡 파트너스 Open API로 상품을 검색하고 내장 영양 DB와 매칭해 비교
- 🛍️ **카테고리 카탈로그 비교** (`/catalog`) — 고정 카테고리(올리브오일/그릭요거트/귀리우유/아몬드버터/프로틴바)별로
  동기화된 상품을 탭으로 탐색, 가격순 정렬·로켓배송 필터, 최대 4개 비교 + 100g당 정규화 영양 비교 + "영양 균형 추천" 배지
- 🛠️ **관리자 화면** (`/admin`) — 카테고리별/전체 쿠팡 동기화, 상품별 영양 성분(중량·8대 영양소·원재료명·특징 태그) 직접 입력
- 🏆 **건강 점수** — 단백질·식이섬유(+) / 당류·포화지방·나트륨·열량(−)을 종합한 0~100점
- 🛒 **수익화** — "쇼핑하기"/"쿠팡에서 구매" 클릭 시 내 파트너스 제휴 링크로 연결되어 수익 발생

### 카테고리 카탈로그 동작 방식

쿠팡 API는 영양 성분을 제공하지 않으므로, `/admin`에서 카테고리를 동기화하면 상품 정보(이름·가격·이미지·제휴 링크)만
저장되고 영양 성분은 `null`로 비워둡니다. 이후 관리자가 `/admin`에서 직접 입력(중량 기준)하면 `/catalog`의 비교 화면에서
100g당 값으로 자동 정규화되어 표시됩니다. 입력 전 상품에는 "성분 미확인" 뱃지가 붙고, 비교 표에서는 "-"로 표시됩니다.

데이터는 `data/catalog.json`(런타임 생성, git 추적 제외)에 저장됩니다.

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
    api/
      search/route.ts             # 자유 검색 API (쿠팡 호출 + 영양 매칭)
      products/route.ts           # GET /api/products?category=
      products/[id]/nutrition/    # PUT 영양성분 수동 입력
      sync/[categoryId]/route.ts  # POST 카테고리 동기화
      sync/all/route.ts           # POST 전체 동기화 (rate limit 고려)
      compare/route.ts            # POST 비교 (100g 정규화)
    page.tsx                      # 자유 검색 화면
    catalog/page.tsx              # 카테고리 탭 + 카탈로그 비교 화면
    admin/page.tsx                # 관리자 화면 (동기화 · 영양성분 입력)
  components/
    ProductCard, ComparisonTable, HealthScoreBadge       # 자유 검색용
    CatalogProductCard, CatalogComparisonTable           # 카탈로그용
    NutritionEditForm                                    # 관리자 인라인 입력 폼
  lib/
    coupang.ts          # 쿠팡 파트너스 API (HMAC 서명) + 데모 폴백 + 동기화 검색
    catalog-store.ts    # 카테고리/카탈로그 JSON 저장소 (data/catalog.json)
    nutrition.ts        # 영양 DB + 매칭 + 건강 점수 (자유 검색용)
    types.ts, format.ts
```

## 면책

영양 성분은 100g 기준 대표값으로 실제 제품과 다를 수 있습니다. 본 서비스는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
