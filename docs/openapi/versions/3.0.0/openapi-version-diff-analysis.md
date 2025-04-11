# OpenAPI v3.1.0 と v3.0.0 の差分分析

この文書では、OpenAPI v3.1.0 と v3.0.0 の間の主要な差分を分析し、実装への影響を考察します。

## 1. オブジェクト構造的差異（追加/削除/変更）

### 1.1 ルートオブジェクト（OpenAPI Object）の差異

| 項目                | v3.0.0     | v3.1.0       | 備考                                                              |
| ------------------- | ---------- | ------------ | ----------------------------------------------------------------- |
| `openapi`           | `3.0.x`    | `3.1.x`      | バージョン表記の差異                                              |
| `paths`             | 必須       | 必須ではない | v3.1.0では`paths`、`components`、または`webhooks`のいずれかが必要 |
| `webhooks`          | 未サポート | 追加         | v3.1.0で新しく追加                                                |
| `jsonSchemaDialect` | 未サポート | 追加         | JSON Schemaのバージョン指定                                       |

### 1.2 追加されたオブジェクト

- **Webhooks Object**: v3.1.0で新規追加
- **Path Items Object**: コンポーネント化されたパスアイテム

### 1.3 変更されたオブジェクト

- **Info Object**: v3.1.0では`summary`フィールドが追加
- **License Object**: v3.1.0では`identifier`フィールドが追加
- **Components Object**: v3.1.0では`pathItems`が追加

## 2. 必須フィールドの差異

### 2.1 OpenAPI Objectの必須フィールド

- v3.0.0: `openapi`, `info`, `paths`が必須
- v3.1.0: `openapi`, `info`が必須、さらに`paths`、`components`、`webhooks`のいずれかが必要

### 2.2 Schema Objectの必須フィールド

両バージョンでSchema Objectに必須フィールドの違いはありませんが、v3.1.0ではJSON Schema Draft 2020-12の仕様に準拠するようになり、スキーマ構造が拡張されています。

## 3. 各フィールドの意味論的差異

### 3.1 Schema Objectの差異

| 機能               | v3.0.0                  | v3.1.0                      | 備考                                                           |
| ------------------ | ----------------------- | --------------------------- | -------------------------------------------------------------- |
| JSON Schema        | Draft 4の修正サブセット | Draft 2020-12の完全サポート | 大きな変更点                                                   |
| 複数の型           | サポートなし            | サポート                    | `type: ["string", "null"]`のような記述が可能に                 |
| `nullable`         | 専用プロパティ          | 型配列で表現                | v3.0.0: `nullable: true`<br>v3.1.0: `type: ["string", "null"]` |
| `$ref`             | 制限あり                | 拡張                        | v3.1.0では`$dynamicRef`と`$dynamicAnchor`をサポート            |
| `contentEncoding`  | 未サポート              | サポート                    | JSONスキーマの機能として追加                                   |
| `contentMediaType` | 未サポート              | サポート                    | JSONスキーマの機能として追加                                   |

### 3.2 リファレンスの扱い

- v3.0.0: 基本的なJSON参照のみサポート
- v3.1.0: より柔軟な参照機能（`$dynamicRef`、`$dynamicAnchor`）をサポート

### 3.3 Paths Objectの扱い

- v3.0.0: 必須コンポーネント
- v3.1.0: オプショナル（代わりにwebhooksやcomponentsのみの定義も可能）

## 4. デフォルト値の差異

### 4.1 OpenAPI Objectのデフォルト値

| フィールド | v3.0.0         | v3.1.0           | 備考                                     |
| ---------- | -------------- | ---------------- | ---------------------------------------- |
| `servers`  | デフォルトなし | `[{"url": "/"}]` | v3.1.0ではデフォルトサーバーが定義される |

### 4.2 jsonSchemaDialect

v3.1.0では`jsonSchemaDialect`フィールドのデフォルト値は`https://spec.openapis.org/oas/3.1/dialect/2024-11-10`

## 5. JSON Schemaの差異

### 5.1 準拠するJSON Schemaバージョン

- v3.0.0: JSON Schema Draft 4の修正サブセット
- v3.1.0: JSON Schema Draft 2020-12の完全サポート

### 5.2 スキーマのバリデーション機能

| 機能           | v3.0.0                    | v3.1.0                  | 備考                     |
| -------------- | ------------------------- | ----------------------- | ------------------------ |
| 複数の型       | 未サポート                | サポート                | 型の配列表現が可能に     |
| NULL値の扱い   | `nullable: true`          | `type: ["X", "null"]`   | 表現方法の変更           |
| バリデーション | Draft 4ベースの制限セット | Draft 2020-12の完全機能 | より強力なバリデーション |

## 6. 実装に影響のある主要な差異

1. **Schema Object**:

   - v3.0.0では`type`は単一の値のみ、v3.1.0では配列も可能
   - v3.0.0の`nullable`プロパティはv3.1.0では非推奨となり、型配列で表現

2. **Webhooks**:

   - v3.1.0で新たに追加されたコンポーネント

3. **Path Items**:

   - v3.1.0ではコンポーネント化され再利用可能に

4. **必須フィールド**:
   - OpenAPIオブジェクトの必須フィールドの変更

## 7. Zodスキーマへの影響分析

### 7.1 新しいスキーマ定義が必要なもの

- WebhooksObjectSchema
- 拡張されたJSON Schema Draft 2020-12対応のSchemaObjectSchema

### 7.2 修正が必要なスキーマ

- OpenAPIObjectSchema: 必須フィールドと新規フィールドの対応
- SchemaObjectSchema: 型の表現方法と`nullable`の扱いの変更
- InfoObjectSchema: `summary`フィールドの追加
- LicenseObjectSchema: `identifier`フィールドの追加
- ComponentsObjectSchema: `pathItems`フィールドの追加

## 8. まとめ

OpenAPI v3.1.0と3.0.0の間には、JSON Schemaの扱い、Webhooksの追加、Path Itemsのコンポーネント化など、複数の重要な差異があります。これらの差異を適切に処理するために、v3.0.0向けの独立したスキーマ実装が必要となります。特に、Schema Objectの処理において、型の表現方法や`nullable`の扱いは大きく異なるため、慎重な実装が求められます。
