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

- [ ] **Config モジュール**

  - [ ] `src/config/index.ts`: 設定管理の実装
  - [ ] テスト: `tests/config/index.test.ts`の実装

- [ ] **Core モジュール**

  - [ ] `src/core/server.ts`: MCPサーバーコア機能の実装
  - [ ] `src/core/transport.ts`: トランスポート層の実装
  - [ ] テスト: コアモジュールのテスト実装

- [ ] **OpenAPI モジュール**

  - [ ] `src/openapi/client.ts`: クライアント生成・管理の実装
  - [ ] `src/openapi/parser.ts`: スペック解析の実装
  - [ ] `src/openapi/schema.ts`: スキーマ検証の実装
  - [ ] テスト: OpenAPIモジュールのテスト実装

- [ ] **Tools モジュール**

  - [ ] `src/tools/builder.ts`: ツール生成ロジックの実装
  - [ ] `src/tools/executor.ts`: ツール実行処理の実装
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
├── core/
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

### 3. `core/`

- `server.ts`: MCPサーバーの初期化と管理
- `transport.ts`: 通信層の抽象化（StdioServerTransportなど）

### 4. `openapi/`

- `client.ts`: OpenAPIクライアントの生成と管理
- `parser.ts`: OpenAPIスペックの解析とデリファレンス
- `schema.ts`: スキーマのバリデーションと変換

### 5. `tools/`

- `builder.ts`: OpenAPIからMCPツールを生成するロジック
- `executor.ts`: ツールの実行とレスポンス処理

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
import { loadOpenApiSpec } from "./openapi/parser";
import { createMcpServer } from "./core/server";
import { buildToolsFromOpenApi } from "./tools/builder";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  try {
    // コマンドライン引数の処理
    const { openApiSpecPath } = parseCliArgs();

    // OpenAPIスペックの読み込みと検証
    const validatedSchema = await loadOpenApiSpec(openApiSpecPath);

    // MCPサーバーの作成
    const server = createMcpServer(validatedSchema);

    // OpenAPIからMCPツールを生成
    await buildToolsFromOpenApi(server, validatedSchema);

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
   - コアモジュールの実装
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
- **バージョン管理**: APIバージョンの管理と互換性の確保
- **パフォーマンス最適化**: 必要に応じたキャッシングやその他の最適化手法の導入
