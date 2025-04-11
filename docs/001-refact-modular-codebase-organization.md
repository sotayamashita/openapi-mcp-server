# NNN-refact-modular-codebase-organization

## 概要

このリファクタリング計画は、`openapi-mcp-server`のコードベースを再構成し、より堅牢で保守しやすく、テスト可能なアーキテクチャを構築することを目的としています。現在の単一ファイル（`src/index.ts`）は複数の責務を持っており、これを機能ごとに適切に分割することで、コードの可読性と保守性を向上させます。

## 目的

1. **責務の明確な分離**: 各モジュールが単一の責任を持つように設計
2. **コードの再利用性向上**: 重複コードを排除し、適切な抽象化を通じて再利用性を高める
3. **テスト容易性の向上**: 各モジュールが独立してテスト可能な構造に
4. **エラーハンドリングの強化**: 堅牢なエラー処理とバリデーションの実装
5. **拡張性の向上**: 将来の機能追加や変更が容易な構造の実現

## 実装状況

- [x] **CLI モジュール**

  - [x] `src/cli/args.ts`: コマンドライン引数処理の実装
  - [x] `src/cli/index.ts`: CLIエントリーポイントの実装
  - [x] テスト: `tests/cli/args.test.ts`の実装
  - [x] `src/index.ts`からCLIモジュールの利用

- [x] **Config モジュール**

  - [x] `src/config/index.ts`: 設定管理の実装
    - [x] 環境変数（BASE_URL, HEADERS）の読み込みと検証
    - [x] 環境変数BASE_URLを必須とし、OpenAPIスペックのservers情報に関わらず常に使用する設計
    - [x] HEADERSのJSON解析と適切なデフォルト値の提供
  - [x] テスト: `tests/config/index.test.ts`の実装
    - [x] 様々な環境変数パターンでのテストケース
    - [x] エラーケースのテスト

- [ ] **MCP モジュール**

  - [ ] `src/mcp/server.ts`: MCPサーバーコア機能の実装
  - [ ] `src/mcp/transport.ts`: トランスポート層の実装
  - [ ] テスト: MCPモジュールのテスト実装

- [ ] **OpenAPI モジュール**

  - [ ] `src/openapi/client.ts`: クライアント生成・管理の実装
    - [ ] Config モジュールから取得したBASE_URLをOpenAPIClientの生成時に使用
    - [ ] Config モジュールから取得したHEADERSをクライアント設定に適用
  - [ ] `src/openapi/parser.ts`: スペック解析の実装
  - [ ] `src/openapi/schema.ts`: スキーマ検証の実装
  - [ ] テスト: OpenAPIモジュールのテスト実装

- [ ] **Tools モジュール**

  - [ ] `src/tools/builder.ts`: ツール生成ロジックの実装
    - [ ] Config モジュールとOpenAPIモジュールを連携させたMCPツール生成
  - [ ] `src/tools/executor.ts`: ツール実行処理の実装
    - [ ] リクエストURLの構築時にOpenAPIスペックのserversではなくConfig.baseUrlを使用
    - [ ] パラメータの適切な処理と検証
  - [ ] テスト: Toolsモジュールのテスト実装

- [ ] **Utils モジュール**

  - [ ] `src/utils/http.ts`: HTTP関連ユーティリティの実装
  - [ ] `src/utils/validation.ts`: バリデーションヘルパーの実装
  - [ ] テスト: Utilsモジュールのテスト実装

- [ ] **Types モジュール**
  - [ ] `src/types/index.ts`: 共通型定義の実装

## 提案するディレクトリ構造

```
src/
├── cli/
│   ├── args.ts       # コマンドライン引数の処理
│   └── index.ts      # CLIエントリーポイント
├── config/
│   └── index.ts      # 設定管理（環境変数など）
├── mcp/
│   ├── server.ts     # MCPサーバーのコア機能
│   └── transport.ts  # トランスポート層の抽象化
├── openapi/
│   ├── client.ts     # OpenAPI クライアント生成と管理
│   ├── parser.ts     # OpenAPI スペックの解析
│   └── schema.ts     # スキーマ検証とパース
├── tools/
│   ├── builder.ts    # MCP ツール生成ロジック
│   └── executor.ts   # ツール実行と結果ハンドリング
├── utils/
│   ├── http.ts       # HTTP関連ユーティリティ
│   └── validation.ts # バリデーションヘルパー
├── types/
│   └── index.ts      # 型定義
└── index.ts           # アプリケーションのエントリーポイント
```

## 各ディレクトリの責務

### 1. `cli/`

- `args.ts`: コマンドライン引数の処理、パースと検証
- `index.ts`: CLIのエントリーポイント、ユーザー入力と出力の管理

### 2. `config/`

- `index.ts`: 環境変数の読み込みと設定の管理
  - BASE_URL: API エンドポイントの指定（必須）
  - HEADERS: カスタムHTTPヘッダーの指定（オプション、JSON形式）
  - 設定のバリデーションとデフォルト値の提供

### 3. `mcp/`

- `server.ts`: MCPサーバーの初期化と管理
- `transport.ts`: 通信層の抽象化（StdioServerTransportなど）

### 4. `openapi/`

- `client.ts`: OpenAPIクライアントの生成と管理
  - 環境変数BASE_URLを使用したクライアント設定
  - 環境変数HEADERSを使用したカスタムヘッダー設定
- `parser.ts`: OpenAPIスペックの解析とデリファレンス
- `schema.ts`: スキーマのバリデーションと変換

### 5. `tools/`

- `builder.ts`: OpenAPIからMCPツールを生成するロジック
  - 環境設定を考慮したツール生成
- `executor.ts`: ツールの実行とレスポンス処理
  - 環境変数BASE_URLを使用したリクエストURL構築（OpenAPIのservers情報より優先）
  - パラメータ処理とリクエスト実行

### 6. `utils/`

- `http.ts`: HTTP関連のユーティリティ関数
- `validation.ts`: 入力検証ヘルパー

### 7. `types/`

- `index.ts`: 共通の型定義

## 具体的なリファクタリング方針

### 1. Single Responsibility Principle (SRP)

- 現在の単一ファイルを機能ごとに分割
- 各モジュールは単一の責務を持つように設計
- コード間の依存関係を明確にし、循環依存を排除

```typescript
// 例: cli/args.ts
import { parseArgs } from "node:util";

export interface CliOptions {
  openApiSpecPath: string;
}

export function parseCliArgs(): CliOptions {
  const { values } = parseArgs({
    options: {
      api: {
        type: "string",
        required: true,
      },
    },
  });

  if (!values.api) {
    throw new Error("OpenAPI specification path is required (--api=<path>)");
  }

  return {
    openApiSpecPath: values.api as string,
  };
}
```

```typescript
// 例: config/index.ts
import dotenv from "dotenv";

// 環境変数の型定義
export interface ServerConfig {
  baseUrl: string;
  headers: Record<string, string>;
}

// デフォルト設定
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": "openapi-mcp-server",
};

/**
 * 環境変数から設定を読み込む
 * @throws {Error} BASE_URL環境変数が設定されていない場合
 */
export function loadConfig(): ServerConfig {
  // 環境変数の読み込み
  dotenv.config();

  // BASE_URLの取得と検証（必須）
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("BASE_URL environment variable is required");
  }

  // HEADERSの解析（JSONまたはデフォルト）
  let headers = DEFAULT_HEADERS;
  if (process.env.HEADERS) {
    try {
      const customHeaders = JSON.parse(process.env.HEADERS);
      headers = { ...DEFAULT_HEADERS, ...customHeaders };
    } catch (error) {
      console.warn(`Invalid HEADERS format: ${error.message}. Using defaults.`);
    }
  }

  return {
    baseUrl,
    headers,
  };
}
```

### 2. DRY (Don't Repeat Yourself)

- リクエスト構築ロジックを共通ユーティリティに抽出
- パラメータ処理を再利用可能な関数に整理
- 重複するバリデーションロジックの共通化

```typescript
// 例: utils/http.ts
export function buildRequestUrl(
  baseUrl: string,
  path: string,
  params: Record<string, any> = {},
): string {
  // パスパラメータを置換
  let pathWithParams = path;

  for (const [key, value] of Object.entries(params)) {
    if (path.includes(`{${key}}`)) {
      pathWithParams = pathWithParams.replace(`{${key}}`, String(value));
    }
  }

  // クエリパラメータを生成
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!path.includes(`{${key}}`) && value !== undefined) {
      queryParams.append(key, String(value));
    }
  }

  const queryString = queryParams.toString();
  return `${baseUrl}${pathWithParams}${queryString ? `?${queryString}` : ""}`;
}
```

### 3. Test-Driven Development (TDD)

- 各モジュールに対応するテストファイルを作成
- 境界値やエッジケースを考慮したテスト設計
- モックを活用した独立したテスト環境の構築

```typescript
// 例: tests/cli/args.test.ts
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { parseCliArgs } from "../../src/cli/args";

describe("CLI Arguments Parser", () => {
  const originalArgv = process.argv;

  afterEach(() => {
    process.argv = originalArgv;
  });

  it("should parse --api argument correctly", () => {
    process.argv = ["node", "index.js", "--api=test.json"];
    const result = parseCliArgs();
    expect(result.openApiSpecPath).toBe("test.json");
  });

  it("should throw error when --api is missing", () => {
    process.argv = ["node", "index.js"];
    expect(() => parseCliArgs()).toThrow(/required/);
  });
});
```

### 4. Separation of Concerns (SoC)

- CLIロジックとサーバーロジックの分離
- OpenAPI処理とMCPツール生成の分離
- 設定管理と実行ロジックの分離

```typescript
// 例: src/index.ts (新しいエントリーポイント)
import { parseCliArgs } from "./cli/args";
import { loadConfig } from "./config";
import { loadOpenApiSpec } from "./openapi/parser";
import { createMcpServer } from "./mcp/server";
import { createOpenApiClient } from "./openapi/client";
import { buildToolsFromOpenApi } from "./tools/builder";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  try {
    // 環境変数の読み込み
    const config = loadConfig();

    // コマンドライン引数の処理
    const { openApiSpecPath } = parseCliArgs();

    // OpenAPIスペックの読み込みと検証
    const validatedSchema = await loadOpenApiSpec(openApiSpecPath);

    // MCPサーバーの作成
    const server = createMcpServer(validatedSchema);

    // OpenAPIクライアントの作成（環境変数BASE_URLを使用）
    const client = await createOpenApiClient(validatedSchema, config);

    // OpenAPIからMCPツールを生成
    await buildToolsFromOpenApi(server, validatedSchema, client, config);

    // サーバーの起動
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
```

```typescript
// 例: openapi/client.ts
import { OpenAPIClientAxios } from "openapi-client-axios";
import type { OpenAPIV3_1 } from "openapi-types";
import { ServerConfig } from "../config";

/**
 * OpenAPIクライアントを生成
 * 常に環境変数で指定されたBASE_URLを使用し、OpenAPIスペックのservers情報は無視する
 */
export async function createOpenApiClient(
  schema: OpenAPIV3_1.Document,
  config: ServerConfig,
) {
  const apiClient = new OpenAPIClientAxios({
    definition: schema,
    axiosConfigDefaults: {
      baseURL: config.baseUrl, // 常に環境変数のBASE_URLを使用
      headers: config.headers,
    },
  });

  return await apiClient.init();
}
```

```typescript
// 例: tools/executor.ts
import { ServerConfig } from "../config";

/**
 * リクエストURLの構築
 * OpenAPIスペックのservers情報ではなく環境変数のBASE_URLを使用
 */
export function buildRequestUrl(
  path: string,
  params: Record<string, any>,
  operation: any,
  config: ServerConfig,
): string {
  // パスパラメータを置換
  let pathWithParams = path;
  if (operation?.parameters) {
    operation.parameters.forEach((param: any) => {
      if (param.in === "path" && params[param.name]) {
        pathWithParams = pathWithParams.replace(
          `{${param.name}}`,
          params[param.name],
        );
      }
    });
  }

  // ベースURLは常に環境変数から取得したものを使用
  let requestUrl = `${config.baseUrl}${pathWithParams}`;

  // クエリパラメータを追加
  const queryParams: string[] = [];
  if (operation?.parameters) {
    operation.parameters.forEach((param: any) => {
      if (param.in === "query" && params[param.name] !== undefined) {
        queryParams.push(
          `${param.name}=${encodeURIComponent(params[param.name])}`,
        );
      }
    });
  }
  if (queryParams.length > 0) {
    requestUrl += `?${queryParams.join("&")}`;
  }

  return requestUrl;
}

/**
 * ツール実行のためのリクエスト処理
 */
export async function executeApiRequest(
  client: any,
  operationId: string,
  params: Record<string, any>,
) {
  try {
    const response = await client[operationId](params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data),
        },
      ],
    };
  } catch (error: any) {
    console.error(`Error executing ${operationId}:`, error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
```

### 5. Defensive Programming

- OpenApiSpecPathのnull/undefined検証
- APIレスポンスの適切なエラーハンドリング
- バリデーションとエラーメッセージの強化

```typescript
// 例: openapi/parser.ts
import { dereference } from "@scalar/openapi-parser";
import { OpenApiObjectSchema } from "@scalar/openapi-types/schemas/3.1/unprocessed";

export async function loadOpenApiSpec(specPath: string): Promise<any> {
  if (!specPath) {
    throw new Error("OpenAPI specification path cannot be empty");
  }

  let text;
  try {
    if (/^https?:\/\//.test(specPath)) {
      const response = await fetch(specPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
      }
      text = await response.text();
    } else {
      const file = Bun.file(specPath);
      text = await file.text();
    }

    const { schema } = await dereference(text);
    return OpenApiObjectSchema.parse(schema);
  } catch (error) {
    throw new Error(`Failed to parse OpenAPI spec: ${error.message}`);
  }
}
```

## 実装計画

1. **フェーズ1**: 基本的なディレクトリ構造の作成と既存コードの分割

   - ディレクトリ構造のセットアップ
   - MCPモジュールの実装
   - 基本的なテストの追加

2. **フェーズ2**: エラーハンドリングと型安全性の強化

   - バリデーションの強化
   - エラーハンドリングの改善
   - 型定義の整備

3. **フェーズ3**: テストカバレッジの向上とドキュメント整備
   - ユニットテストの拡充
   - 統合テストの追加
   - ドキュメントの更新

## 期待される効果

- **保守性の向上**: 明確に分離された責務により、コードの理解と修正が容易に
- **品質の向上**: テストカバレッジの増加によるバグの減少
- **拡張性の向上**: 新機能の追加が容易に
- **開発効率の向上**: モジュール単位での開発とテストが可能に
- **チームでの開発効率**: コードの責務が明確になることで、並行開発が容易に

## 追加の考慮事項

- **依存性注入**: 柔軟なテストとモック化のための依存性注入パターンの活用
- **ログ機能の強化**: 適切なログレベルとフォーマットの導入
- **設定の柔軟化**: 環境変数や設定ファイルによる設定の外部化
  - BASE_URLとHEADERSの適切な取り扱い
  - OpenAPIスペックのservers情報より環境変数の設定を優先
- **バージョン管理**: APIバージョンの管理と互換性の確保
- **パフォーマンス最適化**: 必要に応じたキャッシングやその他の最適化手法の導入
