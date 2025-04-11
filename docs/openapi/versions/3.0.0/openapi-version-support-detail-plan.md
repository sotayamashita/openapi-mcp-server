# OpenAPI v3.0.0 実装詳細計画書

## 1. 実装アプローチの詳細

### 1.1 独立性の確保

- 各バージョンのスキーマ定義は完全に分離したモジュールとして実装
- 共通部分は抽象化せず、それぞれのバージョンで個別に実装
- 以下のディレクトリ構造を採用:
  ```
  src/
  └── openapi/                     # OpenAPI specification handling
      ├── common/                  # Version-agnostic shared code
      │   └── utils.ts             # Common helper functions
      ├── versions/                # Version-specific implementations
      │   └── 3.0.0/               # OpenAPI 3.0.0 specific implementation
      │       ├── schemas/         # 3.0.0 schema definitions
      │       │   └── processed/   # Processed schema types
      │       │       └── index.ts # Processed schema type definitions
      │       └── parser.ts        # 3.0.0 parser implementation
      ├── schema.ts                # Entry point with version selection logic
      ├── parser.ts                # Version-aware facade forwarding to appropriate parser
      └── client.ts                # Version-independent client implementation
  ```

### 1.2 スキーマ定義ファイル構造と命名規則

@scalar/openapi-types/dist/schemas/3.1/processed との一貫性を保つため、以下のファイル構造と命名規則を厳密に採用します：

```
src/openapi/versions/3.0.0/schemas/processed/
├── index.ts                  # メインエクスポートファイル
├── callback.ts               # Callback オブジェクト定義
├── components.ts             # Components オブジェクト定義
├── contact.ts                # Contact オブジェクト定義
├── discriminator.ts          # Discriminator オブジェクト定義
├── encoding.ts               # Encoding オブジェクト定義
├── example.ts                # Example オブジェクト定義
├── external-documentation.ts # ExternalDocumentation オブジェクト定義
├── header.ts                 # Header オブジェクト定義
├── info.ts                   # Info オブジェクト定義
├── license.ts                # License オブジェクト定義
├── link.ts                   # Link オブジェクト定義
├── media-type.ts             # MediaType オブジェクト定義
├── oauth-flows.ts            # OAuthFlows オブジェクト定義
├── operation.ts              # Operation オブジェクト定義
├── parameter.ts              # Parameter オブジェクト定義
├── path-item.ts              # PathItem オブジェクト定義
├── paths.ts                  # Paths オブジェクト定義
├── reference.ts              # Reference オブジェクト定義
├── request-body.ts           # RequestBody オブジェクト定義
├── response.ts               # Response オブジェクト定義
├── responses.ts              # Responses オブジェクト定義
├── schema.ts                 # Schema オブジェクト定義
├── security-requirement.ts   # SecurityRequirement オブジェクト定義
├── security-scheme.ts        # SecurityScheme オブジェクト定義
├── server-variable.ts        # ServerVariable オブジェクト定義
├── server.ts                 # Server オブジェクト定義
├── tag.ts                    # Tag オブジェクト定義
└── xml.ts                    # XML オブジェクト定義
```

- 各スキーマは独立したファイルに定義し、ケバブケース（kebab-case）でファイル名を設定
- 各ファイルはそのスキーマに関連する型だけを含み、最小限の依存関係を持つように設計
- 型名はキャメルケース（camelCase）またはパスカルケース（PascalCase）で統一
- 複合単語を使用したファイル名の場合はケバブケースで統一（例: `external-documentation.ts`）
- 各ファイルはそれぞれ1つの主要なスキーマ型をエクスポート
- index.tsファイルはすべてのスキーマをまとめてエクスポート
- マイナー要素でも独立ファイルとして扱い、一貫性を保持

この構造に従うことで、@scalar/openapi-types との互換性を確保し、開発者が両方のバージョンを同時に扱う際の認知負荷を軽減します。

## 2. 実装詳細

### 2.1 コア機能実装

#### 2.1.1 `3.0.0/schemas/processed/index.ts` の実装

```typescript
// src/openapi/versions/3.0.0/schemas/processed/index.ts
import { z } from "zod";
import { InfoSchema } from "./info";
import { PathsSchema } from "./paths";
import { ComponentsSchema } from "./components";
import { ServerSchema } from "./server";
import { SecurityRequirementSchema } from "./security-requirement";
import { TagSchema } from "./tag";
import { ExternalDocumentationSchema } from "./external-documentation";

export const OpenApiObjectSchema = z.object({
  openapi: z.string().regex(/^3\.0\.\d+$/),
  info: InfoSchema,
  servers: z.array(ServerSchema).optional(),
  paths: PathsSchema,
  components: ComponentsSchema.optional(),
  security: z.array(SecurityRequirementSchema).optional(),
  tags: z.array(TagSchema).optional(),
  externalDocs: ExternalDocumentationSchema.optional(),
});

// 他の型定義を再エクスポート
export * from "./callback";
export * from "./components";
export * from "./contact";
export * from "./discriminator";
export * from "./encoding";
export * from "./example";
export * from "./external-documentation";
export * from "./header";
export * from "./info";
export * from "./license";
export * from "./link";
export * from "./media-type";
export * from "./oauth-flows";
export * from "./operation";
export * from "./parameter";
export * from "./path-item";
export * from "./paths";
export * from "./reference";
export * from "./request-body";
export * from "./response";
export * from "./responses";
export * from "./schema";
export * from "./security-requirement";
export * from "./security-scheme";
export * from "./server-variable";
export * from "./server";
export * from "./tag";
export * from "./xml";
```

#### 2.1.2 parser.ts の実装

```typescript
// src/openapi/versions/3.0.0/parser.ts
import { OpenApiObjectSchema } from "./schemas/processed";

export function parseOpenApi(document: any) {
  // OpenAPI 3.0.0ドキュメントのパース実装
  const validatedDoc = OpenApiObjectSchema.parse(document);
  return processOpenApi(validatedDoc);
}

function processOpenApi(validatedDoc: any) {
  // 処理ロジックの実装
  return {
    // 処理済みドキュメント
  };
}

// 他の処理関数
```

### 2.2 v3.0.0 固有の実装要件

- JSON Schema Draft 4 形式の対応
- `example` と `examples` の両方のサポート
- `discriminator` の実装
- コンテンツタイプ処理の対応
- nullable フィールドの処理

## 3. 実装タスク詳細

### 3.1 基本構造の実装（優先度: 高）

1. openapi ディレクトリ構造の作成
2. 3.0.0向けスキーマ定義の基本実装 (src/openapi/versions/3.0.0/schemas/processed/index.ts)
3. @scalar/openapi-types/dist/schemas/3.1/processed と一貫したファイル構造の設定

### 3.2 コアコンポーネント実装（優先度: 高）

1. Info スキーマ実装
2. Paths スキーマ実装
3. Operation スキーマ実装
4. Responses スキーマ実装

### 3.3 拡張コンポーネント実装（優先度: 中）

1. Components スキーマ実装
2. Security スキーマ実装
3. Server スキーマ実装
4. Tag スキーマ実装

### 3.4 スキーマ関連実装（優先度: 中）

1. Schema スキーマ実装（JSON Schema Draft 4 対応）
2. Reference スキーマ実装
3. discriminator 機能の実装

### 3.5 パーサー実装（優先度: 高）

1. parseOpenApi の実装
2. ドキュメント処理ロジックの実装
3. 参照解決ロジックの実装
4. 検証エラー処理の実装

## 4. テスト計画詳細

### 4.1 単体テスト

- 各スキーマのバリデーションテスト
- エッジケース処理の確認

### 4.2 統合テスト

- 実際の OpenAPI 3.0.0 サンプルドキュメントを使用した検証
- Swagger Editor や Swagger UI など一般的なツールから出力されたドキュメントの処理確認

## 5. ロードマップとマイルストーン

### 5.1 フェーズ1: 基本構造実装（1週目）

- ディレクトリ構造セットアップ
- schema.ts 基本実装

### 5.2 フェーズ2: コアコンポーネント実装（2-3週目）

- 主要スキーマの実装
- 基本的なパーサー機能の実装
- 単体テストの実装

### 5.3 フェーズ3: 拡張機能と完成（4週目）

- 残りのスキーマとパーサー機能の実装
- 統合テストの実施
- ドキュメント作成

## 6. 考慮すべき課題と解決策

### 6.1 潜在的な問題点

- JSON Schema の処理の複雑さ
- v3.0.0 特有の機能（nullable フィールドなど）の適切な処理
- 参照解決の対応

### 6.2 解決アプローチ

- 明確なバージョン分離による影響の局所化
- 詳細なテストケースによる問題の早期発見
- ドキュメント化による利用パターンの明確化

## 7. スコープ外項目

以下の項目はこの実装計画の対象外とします：

- バージョン選択メカニズム
- バージョン選択ロジックの実装
- v3.1.0 との互換性対応
- 複数バージョン間の相互運用性テスト
- バージョン検出ロジックのテスト
