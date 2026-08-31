# PhytoWorks API

`apps/api`는 PhytoWorks Shop의 NestJS application 경계입니다. 현재는 application process가 기동하고 HTTP 요청에 응답하는지만 확인하는 health endpoint만 제공합니다. Product, Cart, Order와 같은 사업 기능은 아직 포함하지 않습니다.

## 로컬 실행

저장소 루트에서 의존성을 설치한 뒤 다음 명령을 실행합니다.

```bash
pnpm --filter @phytoworks/api dev
```

기본 주소는 `http://localhost:3001`입니다. 다른 port가 필요하면 `PORT` 환경변수에 1부터 65535 사이의 정수를 지정합니다.

PowerShell에서는 다음과 같이 실행할 수 있습니다.

```powershell
$env:PORT = "3101"
pnpm --filter @phytoworks/api dev
```

production build 결과를 실행하려면 다음 명령을 사용합니다.

```bash
pnpm --filter @phytoworks/api build
pnpm --filter @phytoworks/api start
```

## HTTP 요청

```http
GET /health
```

성공하면 HTTP 200과 다음 JSON을 반환합니다.

```json
{
  "status": "ok"
}
```

이 응답은 NestJS application이 HTTP 요청을 처리할 수 있다는 사실만 의미합니다. 데이터베이스, 외부 서비스, 상품과 주문 상태는 확인하지 않습니다.

## 검증

```bash
pnpm --filter @phytoworks/api lint
pnpm --filter @phytoworks/api typecheck
pnpm --filter @phytoworks/api test
pnpm --filter @phytoworks/api build
```

## module 경계

- `AppModule`은 application에 포함할 feature module만 조합합니다.
- `HealthModule`은 `/health`의 controller와 응답 계약만 소유합니다.
- 향후 Product read API는 `src/product/`의 `ProductModule`로 추가하고 `AppModule`에서 조합합니다.
- Product 기능을 추가할 때에도 `HealthModule`에 사업 로직이나 외부 의존성 검사를 넣지 않습니다.

현재는 web application이 API를 호출하지 않으므로 CORS, global prefix와 API versioning을 설정하지 않았습니다. 요청 DTO가 생기기 전까지 global `ValidationPipe`도 추가하지 않습니다.
